'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  contentConfig,
  pageContentModules,
  pageContentPageKeys,
  pageItemsModules,
  pageItemPageKeys,
  type ContentModule,
  type PageContentModule,
  type PageItemsModule,
} from '@/lib/admin/content-config';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const safeError = () =>
  'The change could not be completed. Check the information and your connection, then try again.';

function isSafeLink(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return true;

  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function revalidateContent(module: ContentModule) {
  const adminPath = module.endsWith('-items')
    ? `/admin/${module.slice(0, -6)}`
    : `/admin/${module}`;

  revalidatePath(adminPath);

  const pagePaths: Partial<Record<ContentModule, string[]>> = {
    about: ['/about'],
    governance: ['/governance'],
    academic: ['/academic'],
    career: ['/career'],
    culture: ['/culture'],
    research: ['/research'],
    sports: ['/sports'],
    alumni: ['/alumni'],
    'membership-content': ['/membership'],
    welfare: ['/welfare'],
    transparency: ['/transparency'],
  };

  for (const pageModule of pageItemsModules) {
    pagePaths[pageModule] = [`/${pageItemPageKeys[pageModule]}`];
  }

  const pages: Record<string, string[]> = {
    faqs: ['/faq', '/membership', '/welfare'],
    documents: ['/transparency'],
    scholarships: ['/scholarships', '/academic'],
    opportunities: ['/opportunities', '/career'],
    partners: ['/partners', '/'],
    ...pagePaths,
  };

  for (const path of pages[module] ?? [`/${module}`]) {
    revalidatePath(path);
  }

  revalidatePath('/');
}

async function context() {
  await requireAdmin();

  const supabase = createClient();

  const { data } = await supabase.auth.getClaims();

  return {
    supabase,
    actor:
      typeof data?.claims?.sub === 'string'
        ? data.claims.sub
        : null,
  };
}

async function log(
  supabase: any,
  actor: string | null,
  module: ContentModule,
  action: string,
  id: string | null,
  extra: Record<string, unknown> = {},
) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      actor_user_id: actor,
      action: `${module}.${action}`,
      entity_type: module,
      entity_id: id,
      metadata: extra,
    });

  return !error;
}

function normalize(
  module: ContentModule,
  input: Record<string, unknown>,
) {
  const config = contentConfig[module];

  const allowed = new Set(
    config.fields.map((field) => field.name),
  );

  const values: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!allowed.has(key)) continue;

    if (key === 'social_links') {
      if (typeof value === 'string' && value.trim()) {
        try {
          values[key] = JSON.parse(value);
        } catch {
          throw new Error('Social links must be valid JSON.');
        }
      } else {
        values[key] = {};
      }
    } else if (key === 'display_order') {
      values[key] = Math.max(
        0,
        Math.min(10000, Number(value) || 0),
      );
    } else if (typeof value === 'string') {
      values[key] = value.trim() || null;
    } else {
      values[key] = value;
    }
  }

  const title = String(values.title ?? '').trim();

  const requiredName =
    module === 'leadership' ||
    module === 'departments' ||
    module === 'chapters' ||
    module === 'universities'
      ? String(values.name ?? '').trim()
      : module === 'partners'
        ? String(values.organization ?? '').trim()
        : module === 'faqs'
          ? String(values.question ?? '').trim()
          : title;

  if (!requiredName) {
    throw new Error(
      'Please provide the required name or title.',
    );
  }

  if (module === 'events' || module === 'news') {
    values.slug = slugify(
      String(values.slug || title),
    );
  }

  for (const field of config.fields) {
    let value = values[field.name];

    if (
      (module === 'partners' || module === 'universities') &&
      field.name === 'website' &&
      typeof value === 'string' &&
      value &&
      !value.startsWith('/') &&
      !/^https?:\/\//i.test(value)
    ) {
      value = `https://${value}`;
      values[field.name] = value;
    }

    if (
      field.required &&
      (value === null ||
        value === undefined ||
        value === '')
    ) {
      throw new Error(
        `Please provide ${field.label.toLowerCase()}.`,
      );
    }

    if (
      typeof value === 'string' &&
      value.length > 15000
    ) {
      throw new Error(
        'One of the text fields is too long.',
      );
    }

    if (
      (field.type === 'url' ||
        field.type === 'file' ||
        field.type === 'image') &&
      typeof value === 'string' &&
      value &&
      !isSafeLink(value)
    ) {
      throw new Error(
        `Enter a valid HTTP or HTTPS URL for ${field.label.toLowerCase()}, or use a site path.`,
      );
    }
  }

  if (
    module === 'departments' &&
    values.number &&
    !/^\d{2}$/.test(String(values.number))
  ) {
    throw new Error(
      'Department number must contain two digits.',
    );
  }

  if (module === 'leadership' && values.social_links) {
    if (
      typeof values.social_links !== 'object' ||
      Array.isArray(values.social_links)
    ) {
      throw new Error(
        'Social links must be a JSON object.',
      );
    }

    if (
      Object.values(
        values.social_links as Record<string, unknown>,
      ).some(
        (url) =>
          typeof url !== 'string' ||
          (url &&
            !url.startsWith('/') &&
            !/^https:\/\//i.test(url)),
      )
    ) {
      throw new Error(
        'Social links must use a site path or secure https URL.',
      );
    }
  }

  return values;
}

export async function saveContent(input: {
  module: ContentModule;
  id?: string;
  values: Record<string, unknown>;
  status?: string;
}) {
  if (
    !contentConfig[input?.module] ||
    !input.values ||
    typeof input.values !== 'object'
  ) {
    return {
      ok: false,
      message: 'This content type is not available.',
    };
  }

  try {
    const { supabase, actor } = await context();

    const values = normalize(
      input.module,
      input.values,
    );

    const config = contentConfig[input.module];

    const status =
      input.status ??
      (input.module === 'chapters'
        ? 'inactive'
        : 'draft');

    if (
      input.module === 'chapters'
        ? ![
            'active',
            'coming_soon',
            'inactive',
          ].includes(status)
        : ![
            'draft',
            'published',
            'archived',
          ].includes(status)
    ) {
      return {
        ok: false,
        message:
          'That status is not supported for this content.',
      };
    }

    const pageModule =
      pageContentModules.includes(
        input.module as PageContentModule,
      );

    const pageItemsModule =
      pageItemsModules.includes(
        input.module as PageItemsModule,
      );

    const pageKey = pageModule
      ? pageContentPageKeys[
          input.module as PageContentModule
        ]
      : pageItemsModule
        ? pageItemPageKeys[
            input.module as PageItemsModule
          ]
        : null;

    const payload = {
      ...values,
      ...(pageKey ? { page_key: pageKey } : {}),
      status,
    };

    let query: any;

    if (input.id) {
      let update = supabase
        .from(config.table)
        .update(payload)
        .eq('id', input.id);

      if (pageKey) {
        update = update.eq(
          'page_key',
          pageKey,
        );
      }

      query = await update
        .select('*')
        .maybeSingle();
    } else {
      query = await supabase
        .from(config.table)
        .insert(payload)
        .select('*')
        .single();
    }

    if (query.error || !query.data) {
      // The raw database message is logged for administrators but never returned
      // to the browser, which would otherwise leak schema details.
      console.error('saveContent database error:', query.error);

      return {
        ok: false,
        message: safeError(),
      };
    }

    let auditSaved = await log(
      supabase,
      actor,
      input.module,
      input.id ? 'edit' : 'create',
      query.data.id,
      { status },
    );

    if (
      status === 'published' ||
      status === 'active' ||
      status === 'coming_soon'
    ) {
      auditSaved =
        (await log(
          supabase,
          actor,
          input.module,
          'publish',
          query.data.id,
          { status },
        )) && auditSaved;
    }

    revalidateContent(input.module);

    return {
      ok: true,
      record: query.data,
      auditSaved,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : safeError(),
    };
  }
}

export async function changeContentStatus(
  module: ContentModule,
  id: string,
  status: string,
) {
  if (!contentConfig[module] || !id) {
    return {
      ok: false,
      message: safeError(),
    };
  }

  try {
    const { supabase, actor } = await context();

    const valid =
      module === 'chapters'
        ? [
            'active',
            'coming_soon',
            'inactive',
          ]
        : [
            'draft',
            'published',
            'archived',
          ];

    if (!valid.includes(status)) {
      return {
        ok: false,
        message:
          'That status is not supported.',
      };
    }

    let update = supabase
      .from(contentConfig[module].table)
      .update({ status })
      .eq('id', id);

    if (
      pageContentModules.includes(
        module as PageContentModule,
      )
    ) {
      update = update.eq(
        'page_key',
        pageContentPageKeys[
          module as PageContentModule
        ],
      );
    }

    if (
      pageItemsModules.includes(
        module as PageItemsModule,
      )
    ) {
      update = update.eq(
        'page_key',
        pageItemPageKeys[
          module as PageItemsModule
        ],
      );
    }

    const {
      data,
      error,
    } = await update
      .select('id')
      .maybeSingle();

    if (error || !data) {
      return {
        ok: false,
        message: safeError(),
      };
    }

    const auditSaved = await log(
      supabase,
      actor,
      module,
      status === 'published' ||
      status === 'active' ||
      status === 'coming_soon'
        ? 'publish'
        : status === 'archived'
          ? 'archive'
          : 'unpublish',
      id,
      { status },
    );

    revalidateContent(module);

    return {
      ok: true,
      auditSaved,
    };
  } catch (error) {
    // Server errors are logged rather than silently swallowed, so a broken
    // deployment is diagnosable from the logs. The admin still gets safe text.
    console.error('content action failed:', error);
    return {
      ok: false,
      message: safeError(),
    };
  }
}

export async function deleteContent(
  module: ContentModule,
  id: string,
) {
  if (!contentConfig[module] || !id) {
    return {
      ok: false,
      message: safeError(),
    };
  }

  try {
    const { supabase, actor } = await context();

    let deletion = supabase
      .from(contentConfig[module].table)
      .delete()
      .eq('id', id);

    if (
      pageContentModules.includes(
        module as PageContentModule,
      )
    ) {
      deletion = deletion.eq(
        'page_key',
        pageContentPageKeys[
          module as PageContentModule
        ],
      );
    }

    if (
      pageItemsModules.includes(
        module as PageItemsModule,
      )
    ) {
      deletion = deletion.eq(
        'page_key',
        pageItemPageKeys[
          module as PageItemsModule
        ],
      );
    }

    const { error } = await deletion;

    if (error) {
      return {
        ok: false,
        message:
          'This item could not be removed. It may still be referenced by other records.',
      };
    }

    const auditSaved = await log(
      supabase,
      actor,
      module,
      'delete',
      id,
    );

    revalidateContent(module);

    return {
      ok: true,
      auditSaved,
    };
  } catch (error) {
    // Server errors are logged rather than silently swallowed, so a broken
    // deployment is diagnosable from the logs. The admin still gets safe text.
    console.error('content action failed:', error);
    return {
      ok: false,
      message: safeError(),
    };
  }
}

export async function reorderContent(
  module: ContentModule,
  ids: string[],
) {
  if (
    !contentConfig[module]?.ordered ||
    !Array.isArray(ids) ||
    ids.length > 500 ||
    new Set(ids).size !== ids.length
  ) {
    return {
      ok: false,
      message: 'Order could not be changed.',
    };
  }

  try {
    const { supabase, actor } = await context();

    let auditSaved = true;
    let pageKey: string | null = null;
    let collectionKey: string | null = null;

    if (
      pageItemsModules.includes(
        module as PageItemsModule,
      )
    ) {
      pageKey =
        pageItemPageKeys[
          module as PageItemsModule
        ];

      const {
        data: firstRecord,
        error,
      } = await supabase
        .from('page_items')
        .select('collection_key')
        .eq('id', ids[0])
        .eq('page_key', pageKey)
        .maybeSingle();

      if (
        error ||
        !firstRecord?.collection_key
      ) {
        return {
          ok: false,
          message: safeError(),
        };
      }

      collectionKey =
        firstRecord.collection_key;
    } else if (
      pageContentModules.includes(
        module as PageContentModule,
      )
    ) {
      pageKey =
        pageContentPageKeys[
          module as PageContentModule
        ];
    }

    for (
      let i = 0;
      i < ids.length;
      i += 1
    ) {
      let query = supabase
        .from(contentConfig[module].table)
        .update({
          display_order: i + 1,
        })
        .eq('id', ids[i]);

      if (pageKey) {
        query = query.eq(
          'page_key',
          pageKey,
        );
      }

      if (collectionKey) {
        query = query.eq(
          'collection_key',
          collectionKey,
        );
      }

      const {
        data,
        error,
      } = await query
        .select('id')
        .maybeSingle();

      if (error || !data) {
        return {
          ok: false,
          message: safeError(),
        };
      }

      auditSaved =
        (await log(
          supabase,
          actor,
          module,
          'reorder',
          ids[i],
          {
            display_order: i + 1,
          },
        )) && auditSaved;
    }

    revalidateContent(module);

    return {
      ok: true,
      auditSaved,
    };
  } catch (error) {
    // Server errors are logged rather than silently swallowed, so a broken
    // deployment is diagnosable from the logs. The admin still gets safe text.
    console.error('content action failed:', error);
    return {
      ok: false,
      message: safeError(),
    };
  }
}

export async function recordContentImageUpload(
  module: ContentModule,
  path: string,
) {
  if (
    !contentConfig[module] ||
    !path.startsWith(`${module}/`) ||
    !(
      module === 'documents'
        ? /^documents\/[a-z0-9_-]+\.pdf$/i
        : /^[a-z-]+\/[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i
    ).test(path)
  ) {
    return { ok: false };
  }

  try {
    const { supabase, actor } =
      await context();

    const auditSaved = await log(
      supabase,
      actor,
      module,
      'image_upload',
      null,
      { path },
    );

    return {
      ok: true,
      auditSaved,
    };
  } catch (error) {
    console.error('content action failed:', error);
    return { ok: false };
  }
}
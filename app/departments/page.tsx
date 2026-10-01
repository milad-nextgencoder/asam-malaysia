import { PageHero } from '@/components/site/page-hero';
import { SectionHeader } from '@/components/site/section-header';
import { CTASection } from '@/components/site/cta-section';
import { departments, departmentIconByName } from '@/lib/data/departments';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Departments',
  description: 'Explore all twelve ASAM departments, each focused on a specific area of student life.',
};

export default async function DepartmentsPage() {
  const supabase = createClient();
  const { data, error } = await supabase.from('departments').select('id,name,number,description,mission,icon,image_url,leader,display_order').eq('status', 'published').order('display_order', { ascending: true });
  const renderedDepartments: any[] = !error && data ? data.map((row) => {
    const existing = departments.find((item) => item.number === row.number);
    const dbIcon = row.icon && row.icon in departmentIconByName ? departmentIconByName[row.icon as keyof typeof departmentIconByName] : null;
    return { ...existing, ...row, id: existing?.id ?? `department-${row.number}`, mission: row.mission || row.description || existing?.mission || '', responsibilities: existing?.responsibilities ?? [], programs: existing?.programs ?? [], subSections: existing?.subSections ?? [], icon: dbIcon ?? existing?.icon ?? departments[0].icon };
  }) : departments;
  return (
    <>
      <PageHero
        eyebrow="Departments"
        title="Twelve departments, one mission"
        description="Each ASAM department focuses on a specific area of student life, working together to create a comprehensive support system for Afghan students in Malaysia."
      />

      <section className="py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {renderedDepartments.map((dept, i) => (
              <div
                key={dept.id}
                id={dept.id}
                className="group p-5 lg:p-5 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-300 scroll-mt-24 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-navy shadow-premium">
                        <dept.icon className="h-8 w-8 text-gold" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gold-dark uppercase tracking-wider">
                          Department {dept.number}
                        </div>
                        <h2 className="font-display text-xl lg:text-2xl font-bold">{dept.name}</h2>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{dept.mission}</p>
                    {dept.leader && <p className="mt-3 text-xs text-muted-foreground">Department leader: <span className="font-semibold text-foreground">{dept.leader}</span></p>}
                    {dept.image_url && <img src={dept.image_url} alt="" className="mt-4 max-h-36 w-full rounded-xl object-cover" />}
                  </div>

                  <div className="lg:col-span-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Responsibilities
                    </h3>
                    <ul className="space-y-2">
                      {(dept.responsibilities as string[]).map((r: string) => (
                        <li key={r} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                      Programs
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(dept.programs as string[]).map((p: string) => (
                        <span key={p} className="px-3 py-1.5 rounded-lg bg-secondary/60 text-xs font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 mt-4">
                      Sub-Sections
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(dept.subSections as { title: string; description: string }[]).map((s: { title: string; description: string }) => (
                        <div key={s.title} className="text-xs">
                          <div className="font-semibold">{s.title}</div>
                          <div className="text-muted-foreground text-[9px]">{s.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Want to join a department?"
        description="ASAM departments are always looking for passionate volunteers. Explore available roles and apply to join a department that matches your interests."
        primaryLabel="View Volunteer Roles"
        primaryHref="/join"
      />
    </>
  );
}

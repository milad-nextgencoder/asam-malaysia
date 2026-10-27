# ASAM preview design review

Base: a673ed1, the requested 39t2uccxu Vercel preview.

## Priorities and evidence

1. High — Oversized heading hierarchy: globals.css used 4.5rem homepage and 4.75rem page-title caps, plus repeated section headings up to 3.15rem. Reduce to 3.6rem homepage, 3.25rem page titles, and 2.2rem sections with responsive minimums. Body copy stays 15px; form inputs remain 16px on phones.
2. High — Overlay behavior: site-header.tsx trapped focus but allowed background scrolling. Lock background scroll while search or mobile navigation is open; support Escape on desktop dropdowns.
3. Medium — Repetitive presentation: shared EmptyState used oversized padded, dashed panels and decorative sparkle icons. Replace with compact solid panels and quieter icons. Refine shared CTA spacing, section spacing, card hover borders, and footer links.
4. Medium — Long homepage: app/page.tsx contains 845 lines and many independently CMS-controlled sections. Retain CMS visibility/order and all content; changing its information architecture needs a separate content decision.
5. Medium — Homepage data resilience: one Promise.all and numerous any types remain. Data-fetch isolation and typed database models are follow-up engineering work, outside this visual refinement.
6. Medium — Existing database regression: duplicate-email fixture fails member_profiles_normalized_email_key even on unchanged baseline 8370885. No SQL or membership behavior changed here.

## Scope and limits

Shared public components affect all public routes. Workspace heading refinement is scoped to member/admin/auth routes. Certificate content is excluded. All page source files were inventoried and scanned; authenticated workflows and live record writes were not exercised. Source inspection is not a substitute for authenticated end-to-end testing.

## Page source inventory

- `app/about/page.tsx` (230 lines inspected)
- `app/academic/page.tsx` (166 lines inspected)
- `app/admin/(protected)/[module]/page.tsx` (142 lines inspected)
- `app/admin/(protected)/applications/page.tsx` (17 lines inspected)
- `app/admin/(protected)/members/[id]/page.tsx` (32 lines inspected)
- `app/admin/(protected)/members/page.tsx` (17 lines inspected)
- `app/admin/(protected)/page.tsx` (52 lines inspected)
- `app/admin/login/page.tsx` (22 lines inspected)
- `app/alumni/page.tsx` (140 lines inspected)
- `app/auth/reset-password/page.tsx` (5 lines inspected)
- `app/career/page.tsx` (195 lines inspected)
- `app/certificate/[member-id]/page.tsx` (92 lines inspected)
- `app/chapters/page.tsx` (76 lines inspected)
- `app/contact/page.tsx` (212 lines inspected)
- `app/culture/page.tsx` (154 lines inspected)
- `app/departments/page.tsx` (112 lines inspected)
- `app/events/page.tsx` (137 lines inspected)
- `app/faq/page.tsx` (12 lines inspected)
- `app/gallery/[id]/page.tsx` (16 lines inspected)
- `app/gallery/page.tsx` (60 lines inspected)
- `app/governance/page.tsx` (145 lines inspected)
- `app/join/page.tsx` (218 lines inspected)
- `app/join-asam/page.tsx` (262 lines inspected)
- `app/leadership/page.tsx` (203 lines inspected)
- `app/member/events/page.tsx` (50 lines inspected)
- `app/member/forgot-password/page.tsx` (21 lines inspected)
- `app/member/login/page.tsx` (36 lines inspected)
- `app/member/membership/page.tsx` (76 lines inspected)
- `app/member/notifications/page.tsx` (50 lines inspected)
- `app/member/page.tsx` (79 lines inspected)
- `app/member/profile/page.tsx` (49 lines inspected)
- `app/member/register/page.tsx` (21 lines inspected)
- `app/member/reset-password/page.tsx` (21 lines inspected)
- `app/member/settings/page.tsx` (46 lines inspected)
- `app/membership/page.tsx` (147 lines inspected)
- `app/news/page.tsx` (56 lines inspected)
- `app/opportunities/page.tsx` (182 lines inspected)
- `app/page.tsx` (845 lines inspected)
- `app/partners/page.tsx` (130 lines inspected)
- `app/research/page.tsx` (115 lines inspected)
- `app/scholarships/page.tsx` (13 lines inspected)
- `app/sports/page.tsx` (110 lines inspected)
- `app/transparency/page.tsx` (128 lines inspected)
- `app/universities/page.tsx` (154 lines inspected)
- `app/verify/member/[member-id]/page.tsx` (121 lines inspected)
- `app/verify/page.tsx` (80 lines inspected)
- `app/web-developer/page.tsx` (103 lines inspected)
- `app/welfare/page.tsx` (168 lines inspected)

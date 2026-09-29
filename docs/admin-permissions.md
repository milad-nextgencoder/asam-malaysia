# ASAM Admin Permissions

Authorization is checked by the protected admin layout and again by sensitive server actions. Sidebar visibility is only a usability aid; it is not the security boundary. Supabase Row Level Security remains the data boundary.

| Capability | SUPER_ADMIN | EDITOR | Public visitor |
| --- | --- | --- | --- |
| Manage content modules (homepage, leadership, departments, chapters, universities, events, news, opportunities, scholarships, gallery, partners, documents, FAQs) | Read/write | Read/write | Published content only |
| Read and update contact messages | Yes | Yes | No; may submit only |
| Upload to the existing `asam-public-media` bucket | Yes | Yes | Public reads only |
| Change site-wide settings | Yes | No | Read public settings only |
| View audit history | Yes | No | No |
| Append own audit event | Yes | Yes | No |
| Manage admin role assignments | Yes | No | No |
| Access membership portal or member data | Not part of this CMS | Not part of this CMS | No |

Admin assignment applies to an existing Supabase Auth user ID. The current browser configuration has no service-role key, so this UI does not create Auth accounts or display account email/last-sign-in data. Self-role changes and removal/demotion of the final SUPER_ADMIN are blocked.

The additive migration `20260927010000_general_cms_additive.sql` must be applied before gallery category editing and Editor audit inserts work. It also replaces the existing settings and audit read policies so their database permissions match this matrix.

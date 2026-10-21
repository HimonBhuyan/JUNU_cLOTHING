---
name: Nocturne Atelier
colors:
  surface: '#141312'
  surface-dim: '#141312'
  surface-bright: '#3b3937'
  surface-container-lowest: '#0f0e0d'
  surface-container-low: '#1d1b1a'
  surface-container: '#211f1e'
  surface-container-high: '#2b2a28'
  surface-container-highest: '#363433'
  on-surface: '#e6e1df'
  on-surface-variant: '#ccc6bb'
  inverse-surface: '#e6e1df'
  inverse-on-surface: '#32302f'
  outline: '#959086'
  outline-variant: '#4a463e'
  surface-tint: '#cec6b5'
  primary: '#ffffff'
  on-primary: '#343024'
  primary-container: '#eae2d0'
  on-primary-container: '#6a6456'
  inverse-primary: '#645e50'
  secondary: '#ecbf84'
  on-secondary: '#452b00'
  secondary-container: '#624313'
  on-secondary-container: '#ddb177'
  tertiary: '#ffffff'
  on-tertiary: '#5a1c05'
  tertiary-container: '#ffdbd0'
  on-tertiary-container: '#9d4e33'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eae2d0'
  primary-fixed-dim: '#cec6b5'
  on-primary-fixed: '#1f1b10'
  on-primary-fixed-variant: '#4b4639'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ecbf84'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#5f4111'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59d'
  on-tertiary-fixed: '#390b00'
  on-tertiary-fixed-variant: '#773119'
  background: '#141312'
  on-background: '#e6e1df'
  surface-variant: '#363433'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 46px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '400'
    lineHeight: 34px
  title-lg:
    fontFamily: Playfair Display
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '300'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.14em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.18em
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

## Brand & Style

This design system establishes a high-fashion, editorial boutique commerce presence that captures bespoke craftsmanship, sculptural silhouettes, and uncompromising self-expression. Rooted in haute couture philosophy, the identity balances raw artistic boldness with razor-sharp modern precision.

The visual direction embraces an **Editorial High-Contrast & Minimalist** aesthetic:
- **Atmosphere:** Deep, moody, theatrical luxury reminiscent of private salons and after-hours runway viewings.
- **Tone:** Authoritative, intimate, discerning, and sensual.
- **Imagery & Proportions:** Vertical 3:4 and 4:5 editorial imagery framed by hairline architectural dividers and generous negative space.
- **Audience:** Connoisseurs of artisanal ready-to-wear, collectors of bespoke tailoring, and design-forward luxury shoppers seeking distinctive wardrobe statements.

## Colors

The palette is orchestrated around rich, low-luminance darkness punctuated by luminous champagne and antique metallic tones:

- **Primary (`#F4EBD9` - Champagne Silk):** Serves as the primary typographic high-contrast color against deep canvases, evoking unbleached raw silk and warm candlelight.
- **Secondary (`#C59B63` - Muted Gilt):** A delicate, desaturated gold used for refined accents, metadata badges, active states, and boutique craftsmanship markers.
- **Tertiary (`#C26B4E` - Glazed Terracotta):** An earthy, warm crimson tone applied sparingly for subtle seasonal alerts, limited-edition run callouts, or editorial badges.
- **Neutral (`#11100F` - Espresso Onyx):** The foundational dark ground, leaning slightly warmer than pure black to preserve organic textile warmth. Supporting surface tiers include `#181615` (Surface Container Low) and `#221F1D` (Surface Container Elevated).
- **Hairline Borders (`rgba(244, 235, 217, 0.12)`):** Subtle semi-transparent champagne lines providing architectural structure without visual weight.

## Typography

Typography establishes an editorial tension between the romantic, high-contrast transitional serifs of **Playfair Display** and the clean, structural geometry of **Plus Jakarta Sans**.

- **Editorial Serifs (Headlines & Display):** Rendered in high contrast with italicized moments reserved for drop collections, designer quotes, and collection thematic titles.
- **Modern Sans (Body & Controls):** Kept light (`font-weight: 300` and `400`) with generous leading to maintain effortless legibility and modern restraint.
- **Labels & Micro-Copy:** Expressed exclusively in uppercase with extended tracking (`0.14em` to `0.18em`) to mirror archival museum plaques and luxury atelier labels.

## Layout & Spacing

The layout is structured around an asymmetrical, couture-magazine grid with vast pacing:

- **Desktop (12 Columns):** Generous 48px outer margins with 24px gutters. Product galleries feature alternating column widths (e.g., span-7 imagery paired with span-5 narrative typography) to recreate the pacing of a coffee table art monograph.
- **Tablet (8 Columns):** Standardized 2-column editorial grids with 20px gutters and 32px canvas margins.
- **Mobile (4 Columns):** Full-bleed media modules with 12px gutters and 20px outer padding. Vertical rhythm expands between sections (`space-xl`) to prevent cramped layouts and preserve dramatic focus.

## Elevation & Depth

Visual hierarchy rejects heavy drop shadows in favor of tonal stepping, hairline borders, and atmospheric depth:

- **Tonal Layers:** The baseline canvas rests at `#11100F`. Modal sheets, drawers, and flyouts advance to `#191716` and `#221F1D`.
- **Low-Contrast Micro-Borders:** Panels, input containers, and structural dividers utilize a single 1px hairline border (`rgba(244, 235, 217, 0.12)`). Active or focused borders subtly illuminate to `rgba(197, 155, 99, 0.45)`.
- **Soft Ambient Vignettes:** Overlays and image backdrop scrims apply linear gradient shadows (`linear-gradient(to top, rgba(17, 16, 15, 0.85) 0%, transparent 60%)`) to guarantee label contrast without obscuring silhouette details.

## Shapes

The geometric signature is strictly **Sharp (`roundedness: 0`)**.

- True right-angled precision dominates product frames, action triggers, drawers, and notification ribbons.
- Sharp geometry conveys sartorial discipline, pattern-making sharpness, and high-fashion minimalism.
- The solitary deviation is circular avatars or miniature status dots (e.g., colorway swatches), preserved as pure geometrical counterpoints to the rectangular framework.

## Components

### Buttons
- **Primary Action:** Solid Champagne Silk (`#F4EBD9`) fill with dark espresso text (`#11100F`), uppercase tracked lettering (`label-md`), 0px radius, and 16px vertical padding. On hover, transitions to Muted Gilt (`#C59B63`) with rapid easing.
- **Secondary / Ghost:** Transparent background enclosed by a 1px border (`rgba(244, 235, 217, 0.2)`), displaying primary text. Hover shifts border color to solid primary silk with a subtle 4% white surface glow.
- **Text Action:** Clean, tracked text accompanied by an animated 1px hairline underline that expands from the left.

### Product Cards
- **Form Factor:** Editorial 3:4 portrait aspect ratio framed by razor-thin borders.
- **Hover State:** Smooth crossfade from the primary garment silhouette to an on-model runway or detail crop, accompanied by a subtle 1.02x scale.
- **Meta Treatment:** Item title in `title-lg` Playfair Display, price and sizing in `body-md` aligned horizontally across an architectural split line.

### Form Inputs & Selectors
- **Text Fields:** Underline-only or 1px hairline bordered box styles with no background fill (`transparent`). Floating labels in uppercase `label-sm`. Active focus shifts border to Muted Gilt.
- **Size & Fit Selectors:** Square tiles (44px × 44px) with hairline outlines. Active selection fills the tile with deep charcoal and illuminates the border with primary champagne.

### Chips & Badges
- **Limited Run & Atelier Badges:** Border-only micro-tags featuring 10px uppercase tracking, styled with `rgba(197, 155, 99, 0.35)` borders and muted gilt text.

### Navigation & Drawers
- **Navigation Header:** Semi-translucent dark bar (`rgba(17, 16, 15, 0.85)` with a 12px backdrop blur) bordered by a 1px lower champagne hairline.
- **Bag & Quick-View Drawer:** Slides out from the right canvas edge with sharp corners, utilizing a `#181615` surface and full-bleed image previews.
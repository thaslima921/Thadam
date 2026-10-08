COLOURS
background #FBF3E4   surface #FFF8EA   ink #3A0F18
primary #7A1426      onPrimary #FBF3E4
gold #B8862B         goldText #8A6508   line #DDC48F   navBg #F4E6C8
pressure: comfortable #17702F, moderate #8A6508, high #B45309, veryHigh #B3261E
Always show pressure as text plus a dot, never colour alone.

TYPE
Headings: Cormorant Garamond 700. H1 34, H2 26, H3 21.
Body and Tamil: Hind Madurai 400 and 500. Body 15, small 13.

SPACING AND SHAPE
Spacing scale 4, 8, 12, 16, 24, 32. Screen side padding 20.
Radius: card 14, sheet 24, pill 999. Shadows soft, opacity 0.08.
Minimum touch target 44. Buttons 48 high.

COMPONENTS (src/components/ui)
Button (primary, secondary, ghost), Chip (selectable), Card, SectionHeader, SegmentedControl, Counter, LinkedSliders (three sliders that always total 100), StatusBadge (dot + text), DataBadge (LIVE, RECENT, PREDICTED, ESTIMATED, DEMO), StopCard, TrailThread, BottomSheet, TopBar, EmptyState, ErrorState.

SIGNATURE ELEMENTS
1. Arch hero on Welcome and Home: a surface with top corner radius 160 and a gold border.
2. TrailThread: an SVG vertical line through the stops of a day. Gold border, node circles, segment colour follows each stop's pressure level. It draws in once when the trip result opens and redraws on a replace.
No other decorative motion. Use press feedback of 150 ms and sheet slides only. Respect reduced motion.

LAYOUT
Bottom tabs with text labels: Home, Explore, Plan, Trips, Profile. One sticky primary button per screen. During an active trip show a LIVE TRIP pill above the tabs.

COPY
Home: What do you want to experience?
Planning: Tell Thadam your preferences. We'll build the journey.
Hidden place: A verified place beyond the usual route.
Explanation: Why Thadam chose this
Reroute: Your trip has changed. Here's a better option.
Local experience: Meet the people behind the place.
Live trip: Your journey is live.

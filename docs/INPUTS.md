# THADAM TN — INPUTS SPECIFICATION (docs/INPUTS.md)

GENERAL RULES
- Every input is selection-first. Typing is optional and only for the notes field.
- Defaults come from the user's profile. Show a small 'From your profile' tag on prefilled inputs and a 'Reset to profile' link.
- Validate on change, not on submit. Show one clear message under the field.
- The sticky button stays disabled until all required inputs are valid, and says what is missing.

| INPUT | CONTROL | OPTIONS | DEFAULT | RULE | EFFECT ON THE PLAN |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Start location** | Choice cards | Use my location, Pick on map, Home city | Home city | Required | Origin for travel time |
| **Destination** | Region cards | Thanjavur-Kumbakonam, Madurai, Coimbatore region, Let Thadam choose | Let Thadam choose | Required | Limits candidate places |
| **Dates** | Range calendar | Start and end date | none | Start not before today, end not before start, at most 14 days | Number of days |
| **Travellers** | Three counters | Adults, Children, Seniors | 2, 0, 0 | At least 1 adult, at most 12 people | Room count, pace, cost |
| **Budget** | Presets, slider, custom | Rs 5K, 10K, 20K, 50K+ | Profile default or Rs 10K | At least Rs 1,000. Show per-person, per-day figure | Hard cost limit, optimize budget |
| **Interests** | Multi-select cards | Historical, Traditional, Cultural, Food, Nature, Beach, Rural, Spiritual, Adventure, Photography, Shopping, Art and Craft | Profile interests | Choose 1 to 6 | Intent match (30%) |
| **Travel style** | Segmented | Relaxed, Balanced, Packed | Balanced | One | Stops per day (2, 3, 4) |
| **Destination mix** | Segmented, with Advanced | Famous, Moderate, Hidden, Mixed. Advanced: three linked sliders | Mixed = 30/40/30 | Always totals 100 | Destination preference (15%) |
| **Crowd** | Segmented | Low, Moderate, Any | Profile | One | Pressure weight. Low removes Very high pressure places |
| **Transport** | Multi-select chips | Walking, Bicycle, Two-wheeler, Car, Bus, Train, Cab | Profile | At least 1 | Speed and cost per km |
| **Max continuous travel** | Segmented | 1 hour, 2 hours, 3 hours, Flexible | 2 hours | One | Hard filter on stop distance |
| **Stay** | Cards | Budget, Standard, Premium, Homestay, Resort, No stay | Standard | One | Nightly cost, number of nights |
| **Food** | Multi-select chips | Vegetarian, Non-vegetarian, Vegan, Traditional, Local, Street food, Premium, Budget | Profile | Optional | Meal stops and food cost |
| **Facilities and access** | Toggle cards | Hospital nearby, Pharmacy nearby, Hotel nearby, Fuel nearby, Public transport, Avoid isolated places, Family friendly, Senior friendly, Wheelchair accessible | Profile | Optional | Hard filters plus facility alerts |
| **Notes** | Text, optional | Up to 200 characters | empty | Optional | Read only if an AI adapter is enabled |

QUICK-START PRESETS (data in config, shown on Home)
1. **Weekend getaway**: 2 days, Relaxed, Mixed, Crowd Low
2. **Heritage trail**: 3 days, Balanced, interests Historical and Spiritual, mix 20/50/30
3. **Hidden gems**: 3 days, Balanced, mix 10/30/60, Crowd Low
4. **Family trip**: 3 days, Relaxed, Family friendly and Senior friendly on, Hospital nearby on, Crowd Low

A preset fills the planner and opens it at the first step the user still has to change (usually dates).

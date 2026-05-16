# Image Audit

Source folder: `pictures3`

Audit date: 2026-05-16

Approach: originals were left untouched. Selected images were copied, converted from HEIC when needed, resized, and saved as optimized JPEGs under `public/images/...`. Informal or privacy-sensitive images were not deleted.

## Curated Strategy

- Total images found: 48
- Images used in the public experience: 16
- Images held back as not-used/future-use: 32
- Homepage image load is intentionally small: 1 hero portrait, 1 recognition visual, and 4 MBA/context frames.
- `/life` uses clustered browsing instead of a raw grid: Life, MBA, Recognition, and Portraits. Only the active cluster is shown at a time.
- No ID-card/document photos are displayed. Banner-style visuals are kept as future-use assets unless they become useful for metadata or personal branding.

## Images Used Now

| Source | Optimized path | Use location |
| --- | --- | --- |
| `IMG_3157.heic` | `public/images/profile/profile-hero-01.jpg` | Homepage hero portrait |
| `IMG_3145.heic` | `public/images/profile/profile-campus-01.jpg` | `/life` Portraits cluster |
| `IMG_0388.jpg` | `public/images/achievements/iconic-quiz-01.jpg` | Homepage recognition section and `/life` Recognition cluster |
| `IMG_0368.HEIC` | `public/images/achievements/placement-season-kit-01.jpg` | `/life` Recognition cluster |
| `IMG_9765.HEIC` | `public/images/mba-life/iim-classroom-01.jpg` | Homepage MBA chapter and `/life` MBA cluster |
| `IMG_5118.HEIC` | `public/images/mba-life/iim-collaboration-01.jpg` | Homepage MBA chapter and `/life` MBA cluster |
| `IMG_9150.HEIC` | `public/images/mba-life/iim-campus-01.jpg` | Homepage MBA chapter and `/life` MBA cluster |
| `c3b761f8-9759-4b42-aa87-8b3ff11bd57f.JPG` | `public/images/mba-life/iim-campus-rain-01.jpg` | Homepage MBA chapter and `/life` MBA cluster |
| `IMG_0866.HEIC` | `public/images/gallery/life-window-01.jpg` | `/life` Life cluster |
| `IMG_0940.HEIC` | `public/images/gallery/life-hills-01.jpg` | `/life` Life cluster |
| `IMG_2621.heic` | `public/images/gallery/life-sunset-01.jpg` | `/life` Life cluster |
| `IMG_2911.PNG` | `public/images/gallery/life-viewpoint-01.jpg` | `/life` Life cluster |
| `IMG_6004.HEIC` | `public/images/gallery/life-mountain-portrait-01.jpg` | `/life` Life cluster |
| `IMG_2474.HEIC` | `public/images/gallery/life-friends-viewpoint-01.jpg` | `/life` Life cluster |
| `IMG_1489.HEIC` | `public/images/gallery/life-friends-snow-01.jpg` | `/life` Life cluster |
| `IMG_5535.HEIC` | `public/images/gallery/life-mist-01.jpg` | `/life` Life cluster |

## Full File-by-File Audit

| Current filename | Recommended category | Use now? | Suggested use location | Reason | Quality note | Crop/compress | Duplicate/redundant |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `7R404683.JPG` | future-use only | No | Possible old-profile archive only | Full-body portrait but older, low-light, and less aligned with current MBA positioning. | High resolution but moody/dark. | Compress if ever used. | No |
| `IMG_0360.HEIC` | low-quality / duplicate / not suitable | No | Not used | ID card/photo document is privacy-sensitive and not portfolio storytelling material. | Clear enough but document-style. | Do not publish. | Related to `IMG_9939.HEIC` |
| `IMG_0367.HEIC` | achievement / recognition | Not now | Future campus signals or archive note | Placement season kit is interesting, but the recognition section should stay focused on Iconic Quiz. | Good object shot. | Already converted only as optional reserve if needed. | Duplicate with `IMG_0368.HEIC`; `IMG_0368.HEIC` is cleaner |
| `IMG_0368.HEIC` | achievement / recognition | Yes | `/life` Recognition cluster as a secondary context frame | Cleaner version of the placement season kit; useful as quiet MBA context, but not strong enough for the homepage recognition lead. | Good, sharp object shot. | Converted/compressed. | Better duplicate of `IMG_0367.HEIC` |
| `IMG_0388.jpg` | achievement / recognition | Yes | Homepage recognition section | Best source for Iconic Quiz recognition and clearly shows the iimjobs.com/Markezen/IIM Sirmaur context. | Screenshot/collage, acceptable as proof visual. | Converted/compressed; no heavy crop. | No |
| `IMG_0393.HEIC` | IIM Sirmaur / MBA life | No | Not used | Night campus tower is too dark for the premium homepage. | Underexposed. | Would need heavy editing. | Related to other campus tower photos |
| `IMG_0394.HEIC` | personal life / trips / friends | No | Not used | Moon/trees scene is atmospheric but not specific enough for portfolio story. | Dark and low-context. | Would need crop/edit. | No |
| `IMG_0579.HEIC` | personal life / trips / friends | No | Not used | Suit-group selfie is warm but too casual and selfie-like for homepage. | Slightly soft/night image. | Compress if future private gallery expands. | No |
| `IMG_0651.jpg` | banners / LinkedIn visuals | No | Reserve in `public/images/banners/linkedin-banner-01.jpg` | LinkedIn banner has personal contact details and should not be displayed inside the portfolio. | Cropped screenshot/banner. | Already compressed; privacy review needed before use. | No |
| `IMG_0866.HEIC` | personal life / trips / friends | Yes | `/life` gallery | Quiet window frame feels personal without being too informal. | Good composition. | Converted/compressed. | No |
| `IMG_0940.HEIC` | personal life / trips / friends | Yes | `/life` gallery | Back-facing hill view is tasteful and reflective, better suited to optional gallery than homepage. | Good scenic frame. | Converted/compressed. | No |
| `IMG_1282.HEIC` | personal life / trips / friends | No | Not used | Friend/car selfie is too informal for this portfolio. | Casual selfie quality. | Do not publish now. | No |
| `IMG_1289.jpg` | hero/professional portrait candidate | No | Future portrait reserve | Strong face visibility, but the bamboo background is visually busy and saturated for the current hero. | Good face clarity, heavy processing. | Crop/compress if used later. | No |
| `IMG_1377.HEIC` | personal life / trips / friends | No | Not used | Group rain shot is warm but too casual and low-light. | Soft/noisy. | Do not publish now. | No |
| `IMG_1485.HEIC` | personal life / trips / friends | No | Not used | Waterfall/back-view frame is nice but less distinctive than selected gallery images. | Good but face not visible. | Compress if used later. | No |
| `IMG_1489.HEIC` | personal life / trips / friends | Yes | `/life` gallery | Friend/trip frame is informal, so it belongs only on optional gallery page. | Good enough, candid. | Converted/compressed. | No |
| `IMG_1718.HEIC` | personal life / trips / friends | No | Not used | Group outdoor photo is too informal and visually cluttered. | Moderate quality. | Do not publish now. | No |
| `IMG_2302.HEIC` | personal life / trips / friends | No | Not used | Traditional group shot is personal but does not support current portfolio story. | Indoor and soft. | Do not publish now. | Related to `IMG_2332.HEIC` |
| `IMG_2318.HEIC` | personal life / trips / friends | No | Not used | Seated traditional outfit photo is too personal and less professional. | Soft indoor lighting. | Do not publish now. | Related to `IMG_2320.HEIC` |
| `IMG_2320.HEIC` | personal life / trips / friends | No | Not used | Full-body traditional outfit photo is more personal than portfolio-relevant. | Acceptable but not aligned. | Future-use only. | Related to `IMG_2318.HEIC` |
| `IMG_2332.HEIC` | personal life / trips / friends | No | Not used | Traditional group/walk frame is casual and redundant. | Soft indoor lighting. | Do not publish now. | Related to `IMG_2302.HEIC` |
| `IMG_2474.HEIC` | personal life / trips / friends | Yes | `/life` gallery | Tasteful friend viewpoint image; warm but kept off homepage. | Good scenic frame. | Converted/compressed. | No |
| `IMG_2608.heic` | personal life / trips / friends | No | Not used | Sunset silhouette is too dark and redundant with selected `IMG_2621.heic`. | Dark/low detail. | Do not publish now. | Redundant with `IMG_2621.heic` |
| `IMG_2621.heic` | personal life / trips / friends | Yes | `/life` gallery | Better sunset frame with person visible and good horizontal composition. | Good mood, slightly dark. | Converted/compressed. | Better than `IMG_2608.heic` and `IMG_2622.HEIC` |
| `IMG_2622.HEIC` | personal life / trips / friends | No | Not used | Sunset-only/low-context frame is redundant. | Clean but less personal. | Do not publish now. | Redundant with `IMG_2621.heic` |
| `IMG_2911.PNG` | personal life / trips / friends | Yes | `/life` gallery | Strong scenic portrait, tasteful enough for optional personal page. | Good composition, PNG converted to JPEG. | Converted/compressed. | No |
| `IMG_2991.JPG` | hero/professional portrait candidate | No | Future portrait reserve | Friendly formal portrait, but background is busy and less MBA-campus-specific than selected hero. | Sharp, slightly saturated. | Crop/compress if used later. | Similar role to selected hero |
| `IMG_3081.heic` | personal life / trips / friends | No | Not used | Rooftop/group frame is too casual and distracting for homepage. | Good enough, informal. | Do not publish now. | No |
| `IMG_3130.heic` | IIM Sirmaur / MBA life | No | Future-use only | Formal campus group is useful, but homepage already has enough MBA visuals. | Good, slightly distant faces. | Compress if later used. | Duplicate with `IMG_3133.heic` |
| `IMG_3133.heic` | IIM Sirmaur / MBA life | No | Future-use only | Similar formal group frame; redundant with `IMG_3130.heic`. | Good quality. | Compress if later used. | Duplicate/redundant with `IMG_3130.heic` |
| `IMG_3145.heic` | hero/professional portrait candidate | Yes | `/life` Portraits cluster as an alternate professional candidate | Strong campus portrait, but hand/pose makes it less clean than `IMG_3157.heic` for the homepage hero. | Good, professional. | Converted/compressed. | Alternate to selected hero |
| `IMG_3157.heic` | hero/professional portrait candidate | Yes | Homepage hero | Best blend of face clarity, suit, campus context, warmth, and mobile crop. | Strong portrait. | Converted/compressed. | Best of hero set |
| `IMG_3167.HEIC` | IIM Sirmaur / MBA life | No | Future-use only | Larger formal group photo is credible but too many people for homepage storytelling. | Good but busy. | Compress if used later. | Related to `IMG_3130.heic` and `IMG_3133.heic` |
| `IMG_3537.jpg` | hero/professional portrait candidate | No | Future portrait reserve | High-quality portrait, but more festive/personal than MBA/product positioning. | Sharp, strong camera photo. | Crop/compress if used later. | No |
| `IMG_5118.HEIC` | classroom / academic environment | Yes | MBA chapter section | Best candid group-work classroom frame; supports MBA learning without feeling staged. | Strong, vivid, useful. | Converted/compressed. | No |
| `IMG_5535.HEIC` | personal life / trips / friends | Yes | `/life` gallery | Misty travel portrait works as optional personal texture. | Atmospheric, slightly dark. | Converted/compressed. | No |
| `IMG_5804.HEIC` | personal life / trips / friends | No | Not used | Low-visibility mist frame is weaker than selected `IMG_5535.HEIC`. | Soft/low contrast. | Do not publish now. | Similar mood to `IMG_5535.HEIC` |
| `IMG_6004.HEIC` | personal life / trips / friends | Yes | `/life` gallery | Clear travel portrait with good light and natural feel. | Good quality. | Converted/compressed. | No |
| `IMG_7287.JPG` | personal life / trips / friends | No | Not used | Motorcycle portrait is too informal for this portfolio. | Large file, casual. | Do not publish now. | Related to `IMG_7288.JPG` |
| `IMG_7288.JPG` | personal life / trips / friends | No | Not used | Rotated/casual motorcycle frame is not portfolio-suitable. | Large file, awkward orientation. | Do not publish now. | Related to `IMG_7287.JPG` |
| `IMG_9119.HEIC` | IIM Sirmaur / MBA life | No | Future campus reserve | Good campus gate/tower photo, but not as strong as selected campus frame. | Clear, vertical. | Compress if used later. | Related to campus set |
| `IMG_9143.heic` | IIM Sirmaur / MBA life | No | Future campus reserve | Dramatic amphitheatre/cloud frame, but darker than preferred homepage tone. | Good landscape, underexposed. | Compress/edit if used later. | Related to campus set |
| `IMG_9148.HEIC` | IIM Sirmaur / MBA life | No | Future campus reserve | Vertical campus building frame is strong but not used to avoid clutter. | Good, dramatic backlight. | Compress if used later. | Related to `IMG_9150.HEIC` |
| `IMG_9150.HEIC` | IIM Sirmaur / MBA life | Yes | MBA chapter section | Best wide campus building image for the current chapter section. | Strong horizontal composition. | Converted/compressed. | Best of campus building set |
| `IMG_9162.HEIC` | classroom / academic environment | No | Future reading/MBA reserve | Textbook stack supports MBA context, but reading shelf already uses safer custom book cards. | Good object photo. | Do not publish now. | No |
| `IMG_9765.HEIC` | classroom / academic environment | Yes | MBA chapter section | Best classroom-wide photo; gives academic context without feeling informal. | Strong, clean, useful. | Converted/compressed. | No |
| `IMG_9939.HEIC` | low-quality / duplicate / not suitable | No | Not used | ID card image is privacy-sensitive and unnecessary. | Clear document photo. | Do not publish. | Related to `IMG_0360.HEIC` |
| `c3b761f8-9759-4b42-aa87-8b3ff11bd57f.JPG` | IIM Sirmaur / MBA life | Yes | MBA chapter section | Rainy campus view adds atmosphere without being personal or cluttered. | Lower resolution but acceptable. | Converted/compressed. | No |

## Not-Used List

Not used now: `7R404683.JPG`, `IMG_0360.HEIC`, `IMG_0367.HEIC`, `IMG_0393.HEIC`, `IMG_0394.HEIC`, `IMG_0579.HEIC`, `IMG_0651.jpg`, `IMG_1282.HEIC`, `IMG_1289.jpg`, `IMG_1377.HEIC`, `IMG_1485.HEIC`, `IMG_1718.HEIC`, `IMG_2302.HEIC`, `IMG_2318.HEIC`, `IMG_2320.HEIC`, `IMG_2332.HEIC`, `IMG_2608.heic`, `IMG_2622.HEIC`, `IMG_2991.JPG`, `IMG_3081.heic`, `IMG_3130.heic`, `IMG_3133.heic`, `IMG_3167.HEIC`, `IMG_3537.jpg`, `IMG_5804.HEIC`, `IMG_7287.JPG`, `IMG_7288.JPG`, `IMG_9119.HEIC`, `IMG_9143.heic`, `IMG_9148.HEIC`, `IMG_9162.HEIC`, `IMG_9939.HEIC`.

Primary reasons: too informal, duplicate/redundant, too dark/soft, privacy-sensitive, not aligned with the premium professional homepage, or better kept as future-use material.

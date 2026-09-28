# Topic 2: Sodium and water retention kinetics

> **Verification note (read first):** During this research session the network egress proxy blocked every page fetch (PubMed, PMC, Europe PMC, journal sites, Crossref). Citations below were checked against the **search-engine index of the PubMed or journal page**: title, authors, journal, volume and pages, plus the abstract text shown in the search result. None were read in full. Each one is marked "(abstract/index only)". The worked arithmetic is my own calculation from those numbers.

## Plain-language answer
Extra sodium is held with water: roughly 1 L (≈1 kg) of water for every ~3.2 g of sodium kept in the extracellular fluid. The kidneys clear a salt surplus in a roughly exponential way, with a half-time of about 21 h, and reach a new balance in about 3 days. So if you ate ~2.3 g more sodium (≈1 tsp salt) than usual yesterday, the scale this morning might show about **+0.2 to +0.6 kg**. Most of that is gone within **2-3 days** once intake returns to normal [likely]. That is far too fast and too large to be fat: 0.5 kg of fat overnight would need a surplus of several thousand kcal [certain]. Two things can make the salt effect bigger or smaller. First, long-term Mars-simulation studies show the body can gain or lose several hundred mmol of sodium with no matching change in weight, so the "sodium always carries water" rule does not hold exactly [likely]. Second, for a low-carb dieter, a meal that is both salty and high in carbs makes things worse. Insulin roughly halves how fast the kidney excretes sodium, and bringing back carbs after restriction causes fast sodium and water retention [likely].

## The numbers
| Quantity | Value | Basis |
|---|---|---|
| Sodium in 1 tsp salt (5.8 g NaCl) | ~2.3 g = ~100 mmol | 2300 mg ÷ 23 mg/mmol [certain] |
| Isotonic equivalence (ECF Na ~140 mmol/L) | 1 L water per 140 mmol = 3.2 g Na = 8.2 g NaCl; ≈7 g water per mmol Na; ≈310 g water per g Na | arithmetic [certain as a ceiling if retained isotonically] |
| 100 mmol retained isotonically | ≈0.71 L ≈ 0.71 kg | arithmetic |
| Half-time of transition between sodium steady states | ~21 h (Bie review); 21.8 ± 2.4 h during restriction (Sagnella) | Sources 1, 2 |
| ΔTotal-body Na / Δ(daily Na intake) | ≈1.3 days (i.e., +100 mmol/day sustained → ≈+130 mmol TBS ≈ 0.9 L if isotonic) | Source 1 |
| Time to new steady state after raising intake | within ~3 days (not mono-exponential) | Source 2 |
| Non-water-linked swings in total-body Na at fixed intake | ±200-400 mmol, with no parallel change in body weight or ECW | Source 3 |
| Insulin effect on urinary Na excretion (clamp) | 401 → 213 µeq/min (−47%), GFR unchanged | Source 4 |
| Same in obese vs lean adolescents | −54% obese vs −51% non-obese (effect preserved despite insulin resistance) | Supporting (Rocchini) |
| 3-day fast | ~800 g/day weight loss with progressive natriuresis; carbohydrate refeeding → rapid Na retention | Supporting (Veverbrants & Arky) |

## Insulin resistance / population caveat
- **The sodium-retaining effect of insulin is kept in insulin resistance.** Rocchini et al. 1989 found that obese adolescents, who were much less sensitive to insulin for glucose uptake, reduced their sodium excretion by the same amount as lean controls. This is the "selective insulin resistance" idea: the body resists insulin's effect on glucose but not its effect on sodium. For a person with HOMA-IR 3.58, a carb meal and its bigger insulin spike can probably cause *more* sodium retention than in a lean person, not less [likely].
- **The low-carb state removes this brake.** Low insulin plus ketosis causes natriuresis (extra sodium loss in urine). On an 800 kcal ketogenic diet, 61% of the weight lost by obese subjects over 10 days was water, against 37% on a mixed diet (Yang & Van Itallie 1976, JCI 58:722-30, doi:10.1172/JCI108519; abstract/index only). Bringing back carbs reverses this quickly (Veverbrants & Arky). So a salty, carb-heavy meal for this subject sets off **three** water-gaining effects at once: the sodium load itself, insulin-driven retention of sodium already in the body, and water stored with glycogen (glycogen is covered in another topic, not verified here). The total can easily be above the salt-only estimate [likely].
- **Obesity and diabetes may change tissue sodium storage.** 23Na-MRI found higher muscle sodium (20.6 vs 16.3 mmol/L) and skin sodium (24.5 vs 20.6 mmol/L) in type 2 diabetes (n=59) than in people with primary hypertension (Kannenkeril et al. 2019, J Diabetes Complications 33(7):485-489, doi:10.1016/j.jdiacomp.2019.04.006, PMID 31101486; abstract/index only). Whether this shifts short-term water kinetics in someone who is insulin-resistant but not diabetic is **unknown** [guessing].
- **All the core kinetic data come from a different population.** The subjects were healthy, mostly normal-weight young men on fixed metabolic-ward diets. None were obese, insulin-resistant or on low-carb diets.
- **Discrepancy in the reported weight loss.** The subject reports ~9 kg lost, but a BMI change from 35 to 33 suggests ~6 kg. Early low-carb loss is largely water (see above). That could explain the gap, and it also means several kg could come back quickly as water after a carb and salt refeed, without any fat gain.

## Sources
### 1. Bie 2018 review (standing quantitative model)
- **Citation:** Bie P. 2018. Mechanisms of sodium balance: total body sodium, surrogate variables, and renal sodium excretion. *Am J Physiol Regul Integr Comp Physiol*. doi:10.1152/ajpregu.00363.2017. https://journals.physiology.org/doi/full/10.1152/ajpregu.00363.2017 (abstract/index only; volume and pages not confirmed)
- **Population:** Review of human balance studies. **Mismatch vs subject:** mostly healthy normal-weight adults.
- **Finding / number:** Total-body Na ≈4,200 mmol. Transitions between steady states have T½ ≈21 h. ΔTBS/Δ(intake/day) ≈1.3 days. The review also covers "uneven, nonosmotic distribution" of extra sodium, mainly in skin, and long-term instability of total-body sodium even when intake is constant.
- **Quality / limitations:** Authoritative synthesis. It openly says the classic model is incomplete.

### 2. Sagnella et al. 1990 (direct kinetic measurement)
- **Citation:** Sagnella GA, Markandu ND, Singer DR, MacGregor GA. 1990. Kinetics of renal sodium excretion during changes in dietary sodium intake in man: an exponential process? *Clin Exp Hypertens A* 12(2):171-178. doi:10.3109/10641969009074726. https://www.tandfonline.com/doi/abs/10.3109/10641969009074726 (abstract/index only; PMID not confirmed)
- **Population:** Normal subjects. n=8 went from normal intake to 10 mmol/day for 6 days; n=6 went from 10 to 350 mmol/day for 5 days. **Mismatch vs subject:** healthy, not obese, large step changes.
- **Finding / number:** When intake was cut, excretion fell mono-exponentially with T½ 21.8 ± 2.4 h. When intake was raised, excretion reached the new steady state **within 3 days** but did not follow a single exponential.
- **Quality / limitations:** Small n. Weight and body water were not reported in the abstract.

### 3. Rakova et al. 2013 and Lerchl et al. 2015 (Mars-500 ultra-long balance)
- **Citation:** Rakova N, Jüttner K, Dahlmann A, et al. 2013. Long-term space flight simulation reveals infradian rhythmicity in human Na+ balance. *Cell Metab* 17(1):125-131. PMID 23312287. https://pubmed.ncbi.nlm.nih.gov/23312287/. Companion paper: Lerchl K, Rakova N, Dahlmann A, et al. 2015. Agreement between 24-hour salt ingestion and sodium excretion in a controlled environment. *Hypertension* (Oct 2015). PMID 26259596, doi:10.1161/HYPERTENSIONAHA.115.05851 (both abstract/index only)
- **Population:** 10 healthy men in 105-day (n=4) and 205-day (n=6) confinement, with salt fixed at 12, 9 and 6 g/day. **Mismatch vs subject:** healthy, sedentary confinement, not obese.
- **Finding / number:** Urinary sodium excretion followed weekly rhythms driven by aldosterone. Total-body Na moved by **±200-400 mmol** over roughly monthly cycles **without parallel changes in body weight or extracellular water**. Across the whole study, 92% of dietary salt was recovered in urine. A single 24-h urine could not detect a 3 g/day difference in salt intake.
- **Quality / limitations:** Unusually precise long-term control, but very small n.

### 4. DeFronzo et al. 1975 (insulin antinatriuresis)
- **Citation:** DeFronzo RA, Cooke CR, Andres R, Faloona GR, Davis PJ. 1975. The effect of insulin on renal handling of sodium, potassium, calcium, and phosphate in man. *J Clin Invest* 55:845-855. doi:10.1172/JCI107996. PMID 1120786. https://pubmed.ncbi.nlm.nih.gov/1120786/ (abstract/index only)
- **Population:** 6 water-loaded normal subjects on a euglycaemic insulin infusion (2 mU/kg/min; insulin 98-193 µU/mL). **Mismatch vs subject:** lean, healthy, insulin levels above typical post-meal values.
- **Finding / number:** Urinary sodium excretion fell from 401 ± 46 to 213 ± 18 µeq/min with no change in GFR or renal plasma flow. The site was the distal nephron.
- **Quality / limitations:** Acute, n=6, infusion model rather than a meal.

**Supporting / conflicting sources (abstract/index only):**
- Heer M, Baisch F, Kropp J, Gerzer R, Drummer C. 2000. *Am J Physiol Renal* 278(4):F585-F595, doi:10.1152/ajprenal.2000.278.4.F585, PMID 10751219. 32 healthy men, NaCl 50/200/400/550 mmol/day. Sodium balance was positive and plasma volume rose (+315 ± 37 mL at 550 mmol), but **total body water and body mass did not increase**. A later criticism is that potassium balance was not accounted for.
- Rakova N, et al. 2017. *J Clin Invest* 127(5):1932-1943, PMID 28414302. At +6 g/day salt, men drank *less* water and conserved water through urine concentration.
- Rocchini AP, Katch V, et al. 1989. *Hypertension* 14:367-374, doi:10.1161/01.HYP.14.4.367. Insulin cut sodium excretion by 54% in obese adolescents and 51% in non-obese young adults.
- Veverbrants E, Arky RA. 1969. *J Clin Endocrinol Metab* 29(1):55-62, doi:10.1210/jcem-29-1-55. Carbohydrate refeeding after a 3-day fast caused rapid sodium retention; fat refeeding did not.
- Brands MW, Manhiani MM. 2012. *Am J Physiol Regul Integr Comp Physiol* 303:R1101-R1109, doi:10.1152/ajpregu.00390.2012. Insulin's *chronic* sodium-retaining and hypertensive role is contested (insulinoma patients are not hypertensive; dog studies were negative).
- Strauss MB, et al. 1958. *AMA Arch Intern Med* 102:527-536. The original "kinetic concept": total-body sodium keeps fluctuating around a set point.

## Disagreements between sources
- **Isotonic model vs nonosmotic storage.** The classic balance model (Bie's description of the classic model, Sagnella, Strauss) assumes retained sodium brings isotonic water with it. Heer 2000 and Rakova 2013 found positive sodium balance, or total-body Na swings of 200-400 mmol (isotonic equivalent ≈1.4-2.9 L), **without** matching weight change. The critics' reply, from dog balance studies and the potassium-accounting critique of Heer, is that part of this is measurement error. This is unresolved. In practice it means the isotonic figure is an **upper bound** for water retention, not a fixed constant.
- **Speed of the rise vs the fall.** Excretion falls mono-exponentially (T½ ≈21 h) when sodium is cut. When sodium is added it adapts within 3 days but not mono-exponentially (Sagnella). So a single-exponential washout model is only approximate.
- **Acute vs chronic insulin effect.** The acute antinatriuresis is well replicated (DeFronzo, Rocchini). Whether it causes lasting sodium retention is disputed (Brands & Manhiani). For a question about the next day's scale reading, the acute effect is the one that matters.

## Applying it to the subject
**Scenario:** baseline 2-3 g Na/day (~90-130 mmol), plus 2.3 g (100 mmol) on one day, then back to baseline.
- **Isotonic ceiling:** 100 mmol ÷ 140 mmol/L ≈ 0.7 kg if none of it had been excreted.
- **Next morning** (~12-18 h after the average time of intake), using τ ≈ 1.3 d (T½ ≈ 21 h): retained fraction ≈ e^(−12/31) to e^(−18/31), or 0.56-0.68. That leaves 56-68 mmol, **≈0.4-0.5 kg** if isotonic.
- **Adjusting for nonosmotic storage and day-to-day noise** (Heer, Rakova): realistic range **+0.2 to +0.6 kg** [likely]. Salt alone would rarely push this above ~0.7 kg [likely].
- **Washout:** about 0.2 kg left on day 2, under 0.1 kg by day 3, and effectively gone by 72-96 h [likely]. That assumes water and potassium intake stay normal.
- **If the salty meal also contained substantial carbohydrate** after weeks at 30-60 g/day: add insulin-driven retention of sodium already in the body and glycogen water. **+0.5 to 1.5 kg next morning** is plausible, returning to trend over 2-4 days of going back to low carb [guessing: not directly measured in this population].
- **Practical rule:** a jump overnight or across 1-2 days that fades within 3-4 days is water. Fat gain shows up as a slow trend that lasts beyond a week. Judge progress on a 7-day rolling average, and treat the morning after a restaurant meal or a carb refeed as noise. A true 0.5 kg fat gain would need an energy surplus of several thousand kcal (standard ~7,000-7,700 kcal/kg adipose tissue approximation, not re-verified here).

Confidence: medium, because the isotonic arithmetic and the ~21 h half-time are solid, but the core data come from small groups of healthy lean men, the Titze/Heer work shows the water-per-sodium link is weaker than the classic model assumes, no study measured next-morning weight after a single mixed salt-and-carb meal in obese insulin-resistant people, and I could only check abstracts and index records (no full text).

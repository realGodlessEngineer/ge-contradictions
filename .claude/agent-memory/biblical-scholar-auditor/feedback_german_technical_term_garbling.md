---
name: German technical-term garbling in AI drafts
description: AI drafts substitute wrong cognate for German biblical-theology technical terms; verify against authoritative sources
type: feedback
---

AI drafts garble German technical terms by substituting cognate words. Discovered in batch_18 entry 350: Klaus Koch's "act-consequence connection" was rendered "Tat-Folge-Zusammenhang" but the correct German term is "Tun-Ergehen-Zusammenhang" (from Koch's 1955 essay "Gibt es ein Vergeltungsdogma im Alten Testament?").

**Both compound elements were wrong:**
- "Tat" (deed) → should be "Tun" (doing/acting)
- "Folge" (consequence/result) → should be "Ergehen" (faring/befalling)

**Verified glossary of recurring German technical terms in biblical scholarship:**
- Tun-Ergehen-Zusammenhang (Klaus Koch, 1955) — act-consequence connection / deed-consequence nexus
- Schicksalwirkende Tatsphäre (Koch) — fate-producing sphere of action
- Sitz im Leben (Gunkel) — life-setting / social context
- Heilsgeschichte (von Rad) — salvation history
- Religionsgeschichtliche Schule — history-of-religions school
- Formgeschichte — form criticism
- Redaktionsgeschichte — redaction criticism
- Überlieferungsgeschichte — tradition history
- Traditionsgeschichte — tradition history
- Wirkungsgeschichte (Gadamer/Luz) — history of effects/reception

**Why:** AI token frequency biases produce cognate substitutions. "Tat" appears more often in German text than "Tun" in nominal compounds, leading to false confidence. The same vulnerability applies to any specialist German term.

**How to apply:** When auditing commentary containing any German technical term, verify the exact compound form against authoritative German-language reference (Wibilex, RGG, or original publication). Don't accept first-pass AI rendering of any "Zusammenhang", "Geschichte", or other compound term.

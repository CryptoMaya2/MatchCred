# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""GenLayer Intelligent Contract: Consensus eligibility evaluation with live web source & provenance authentication."""
import json
from genlayer import *

class MatchCredContract(gl.Contract):
    reviews: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def evaluate_requirements_with_provenance(
        self,
        review_id: str,
        evidence_json: str,
        requirements_json: str,
        opportunity_url: str = "",
    ):
        """
        Evaluates requirements against evidence using GenLayer's non-deterministic web
        retrieval (gl.nondet.web.render) to authenticate source provenance for opportunity
        requirements and candidate credential links.
        """
        if not review_id or len(review_id) > 100 or review_id in self.reviews:
            raise gl.vm.UserError('Invalid or duplicate review ID')
        if len(evidence_json) > 16000 or len(requirements_json) > 8000:
            raise gl.vm.UserError('Input exceeds limit')
        if opportunity_url and len(opportunity_url) > 500:
            raise gl.vm.UserError('Opportunity URL exceeds limit')

        evidence = json.loads(evidence_json)
        requirements = json.loads(requirements_json)
        if not isinstance(evidence, list) or not isinstance(requirements, list) or not 0 < len(requirements) <= 20:
            raise gl.vm.UserError('Expected evidence list and 1 to 20 requirements')

        def judge():
            # 1. Source Provenance: Fetch live opportunity requirements if URL provided
            opportunity_web_text = ""
            if opportunity_url and opportunity_url.startswith(("http://", "https://")):
                try:
                    opportunity_web_text = gl.nondet.web.render(opportunity_url, mode='text')[:3500]
                except Exception:
                    opportunity_web_text = ""

            # 2. Credential Provenance: Authenticate external proof URLs for candidate claims
            enriched_evidence = []
            for item in evidence:
                item_dict = dict(item) if isinstance(item, dict) else {"name": str(item)}
                ref_url = item_dict.get('documentRef', '') or item_dict.get('evidence_url', '') or item_dict.get('url', '')

                provenance_status = "SELF_REPORTED"
                provenance_sample = ""

                if isinstance(ref_url, str) and ref_url.startswith(("http://", "https://")):
                    try:
                        fetched_doc = gl.nondet.web.render(ref_url, mode='text')[:1800]
                        if fetched_doc and len(fetched_doc.strip()) > 0:
                            provenance_status = "AUTHENTICATED_WEB_SOURCE"
                            provenance_sample = fetched_doc
                        else:
                            provenance_status = "SOURCE_UNREACHABLE"
                    except Exception:
                        provenance_status = "SOURCE_FETCH_ERROR"

                item_dict['provenance_status'] = provenance_status
                if provenance_sample:
                    item_dict['provenance_sample'] = provenance_sample
                enriched_evidence.append(item_dict)

            # 3. Non-deterministic LLM Evaluation with Provenance Context
            prompt = (
                "You are an intelligent contract validator performing provenance authentication and eligibility assessment. "
                "You must verify credentials and requirements against live web evidence where available.\n\n"
            )
            if opportunity_web_text:
                prompt += f"LIVE OPPORTUNITY WEB SOURCE ({opportunity_url}):\n{opportunity_web_text}\n\n"

            prompt += (
                f"REQUIREMENTS LIST:\n{requirements_json}\n\n"
                f"CANDIDATE EVIDENCE WITH WEB PROVENANCE:\n{json.dumps(enriched_evidence)}\n\n"
                "INSTRUCTIONS:\n"
                "Evaluate each requirement in exact sequence. For each requirement, determine status:\n"
                "- MET: Explicit, authentic supporting evidence exists (verified web sources given highest trust).\n"
                "- NOT MET: Contradicted by evidence or source.\n"
                "- UNCLEAR: Missing or unverified evidence.\n"
                "Return ONLY a JSON array in requirement order. Each element must be an object with:\n"
                "- status: 'MET' | 'NOT MET' | 'UNCLEAR'\n"
                "- provenance: 'AUTHENTICATED_WEB_SOURCE' | 'SELF_REPORTED' | 'UNVERIFIED'\n"
                "- explanation: concise justification referencing the evidence or web source."
            )

            response = gl.nondet.exec_prompt(prompt)
            items = json.loads(response)
            if not isinstance(items, list) or len(items) != len(requirements):
                raise gl.vm.UserError('Invalid evaluation length')
            for item in items:
                if not isinstance(item, dict) or item.get('status') not in ('MET', 'NOT MET', 'UNCLEAR'):
                    raise gl.vm.UserError('Invalid status in evaluation item')
                if 'provenance' not in item:
                    item['provenance'] = 'SELF_REPORTED'
            return items

        # Comparative consensus across validators enforcing both substance and provenance authenticity
        items = gl.eq_principle.prompt_comparative(
            judge,
            principle=(
                'Validators must reach consensus on requirement status (MET, NOT MET, UNCLEAR) '
                'and provenance authenticity. Evaluations must agree in substance and be anchored '
                'in verified web sources and candidate evidence.'
            ),
        )
        self.reviews[review_id] = json.dumps(items)

    @gl.public.write
    def evaluate_requirements(self, review_id: str, evidence_json: str, requirements_json: str):
        """Backward-compatible entry point delegating to provenance evaluation without external URL."""
        self.evaluate_requirements_with_provenance(review_id, evidence_json, requirements_json, "")

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        return self.reviews[review_id] if review_id in self.reviews else ''

# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""Consensus eligibility review of self-reported evidence; not issuer authentication."""
import json
from genlayer import *

class MatchCredContract(gl.Contract):
    reviews: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def evaluate_requirements(self, review_id: str, evidence_json: str, requirements_json: str):
        if not review_id or len(review_id) > 100 or review_id in self.reviews:
            raise gl.vm.UserError('Invalid or duplicate review ID')
        if len(evidence_json) > 12000 or len(requirements_json) > 6000:
            raise gl.vm.UserError('Input exceeds limit')
        evidence = json.loads(evidence_json)
        requirements = json.loads(requirements_json)
        if not isinstance(evidence, list) or not isinstance(requirements, list) or not 0 < len(requirements) <= 20:
            raise gl.vm.UserError('Expected evidence list and 1 to 20 requirements')

        def judge():
            response = gl.nondet.exec_prompt(
                'Assess self-reported evidence against each requirement. This is eligibility guidance, '
                'not credential authenticity verification. Return ONLY a JSON array in requirement order '
                'with objects containing status (MET, NOT MET, UNCLEAR) and explanation. '
                'MET requires explicit supporting evidence; NOT MET requires contradictory evidence; '
                'otherwise UNCLEAR. Never invent qualifications. Evidence: ' + evidence_json +
                ' Requirements: ' + requirements_json
            )
            items = json.loads(response)
            if not isinstance(items, list) or len(items) != len(requirements):
                raise gl.vm.UserError('Invalid evaluation length')
            for item in items:
                if not isinstance(item, dict) or item.get('status') not in ('MET', 'NOT MET', 'UNCLEAR'):
                    raise gl.vm.UserError('Invalid status')
            return items

        items = gl.eq_principle.prompt_comparative(
            judge,
            principle='Each requirement status must agree in substance and be supported by the evidence. Explanations may differ in wording.',
        )
        self.reviews[review_id] = json.dumps(items)

    @gl.public.view
    def get_review(self, review_id: str) -> str:
        return self.reviews[review_id] if review_id in self.reviews else ''

# MatchCred Intelligent Contract
# Target Network: GenLayer Studionet (Chain ID 61999, RPC: https://studio.genlayer.com/api)
import genlayer as gl

class MatchCredContract(gl.Contract):
    """
    Intelligent Contract for MatchCred on GenLayer Studionet:
    Verifies candidate academic & professional credentials against opportunity requirements
    using decentralized non-deterministic LLM consensus.
    """

    @gl.public.view
    def evaluate_requirements(self, credentials: list[dict], requirements: list[str]) -> dict:
        """
        Compares submitted credentials with opportunity requirements via LLM consensus on Studionet.
        """
        prompt = f"""
        You are an evaluator for MatchCred on GenLayer Studionet. Compare the candidate's credentials with the opportunity requirements.

        User credentials:
        {credentials}

        Opportunity requirements:
        {requirements}

        Output guidelines:
        - Classify each requirement strictly as: MATCH, NOT MET, or UNCLEAR.
        - Ensure experience requirements are only marked MATCH if verifiable experience or practice is listed.
        - Degrees and professional licenses are distinct.
        - Return valid JSON matching the MatchCred schema:
          {{
            "totalRequirements": int,
            "matchedCount": int,
            "unmetCount": int,
            "unclearCount": int,
            "items": [
              {{
                "requirement": str,
                "status": "MATCH" | "NOT MET" | "UNCLEAR",
                "explanation": str
              }}
            ]
          }}
        """
        return gl.llm_call(prompt)

import unittest
from unittest.mock import MagicMock, patch

from llm_router import ChatMessage, ChatResponse, LLMRouter


class TestLLMRouter(unittest.TestCase):
    def setUp(self):
        self.api_key = "test-key-sk-or-v1"
        self.router = LLMRouter(api_key=self.api_key)

    def test_schema_parsing(self):
        # Exact schema provided by user
        raw_schema = {
            "id": "gen-998877",
            "model": "upstage/solar-pro-3:free",
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "Hello! I am Solar Pro, how can I assist you with Daily Bugle?",
                    }
                }
            ],
            "usage": {
                "prompt_tokens": 12,
                "completion_tokens": 85,
                "total_tokens": 97,
            },
        }

        resp = ChatResponse.from_dict(raw_schema)

        # 1. Test object attribute access
        self.assertEqual(resp.id, "gen-998877")
        self.assertEqual(resp.model, "upstage/solar-pro-3:free")
        self.assertEqual(resp.content, "Hello! I am Solar Pro, how can I assist you with Daily Bugle?")
        self.assertEqual(resp.usage.prompt_tokens, 12)
        self.assertEqual(resp.usage.completion_tokens, 85)
        self.assertEqual(resp.usage.total_tokens, 97)

        # 2. Test dict subscript access (matches user's print statements)
        self.assertEqual(
            resp["choices"][0]["message"]["content"],
            "Hello! I am Solar Pro, how can I assist you with Daily Bugle?",
        )
        self.assertEqual(resp["model"], "upstage/solar-pro-3:free")
        self.assertEqual(resp["usage"]["total_tokens"], 97)

        # 3. Test serialization
        d = resp.to_dict()
        self.assertEqual(d["model"], "upstage/solar-pro-3:free")
        self.assertEqual(len(d["choices"]), 1)
        self.assertEqual(d["usage"]["total_tokens"], 97)

    @patch("llm_router.client.requests.post")
    def test_chat_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "id": "gen-12345",
            "model": "upstage/solar-pro-3:free",
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "I am an AI assistant powered by OpenRouter.",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {"prompt_tokens": 12, "completion_tokens": 85, "total_tokens": 97},
        }
        mock_post.return_value = mock_response

        response = self.router.chat([
            {"role": "user", "content": "Hello! What can you help me with today?"}
        ])

        # Attribute access
        self.assertEqual(response.content, "I am an AI assistant powered by OpenRouter.")
        self.assertEqual(response.model, "upstage/solar-pro-3:free")
        self.assertEqual(response.usage.total_tokens, 97)

        # Dict access matching user snippet:
        self.assertEqual(response["choices"][0]["message"]["content"], "I am an AI assistant powered by OpenRouter.")
        self.assertEqual(response["model"], "upstage/solar-pro-3:free")

        # Verify POST payload and headers
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args.kwargs
        self.assertIn("Authorization", call_kwargs["headers"])
        self.assertEqual(call_kwargs["headers"]["Authorization"], f"Bearer {self.api_key}")


if __name__ == "__main__":
    unittest.main()

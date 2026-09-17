import email
from email.message import EmailMessage
import unittest
from unittest.mock import MagicMock, patch

from gmail import GmailClient, SubstackDigest, SubstackEmail


SAMPLE_SUBSTACK_RAW = b"""From: "Lenny's Newsletter" <newsletter@substack.com>
To: newslettermanager12@gmail.com
Subject: How to build a product that sells itself
Date: Thu, 17 Sep 2026 08:30:00 +0000
Content-Type: multipart/alternative; boundary="boundary-123"
List-Unsubscribe: <https://substack.com/unsubscribe/12345>

--boundary-123
Content-Type: text/plain; charset="utf-8"

In this week's issue, we break down self-serve growth loops and how top tech companies scale without massive sales teams.
Read the full article online: https://lennysnewsletter.substack.com/p/how-to-build-a-product-that-sells-itself

--boundary-123
Content-Type: text/html; charset="utf-8"

<html>
  <body>
    <h1>How to build a product that sells itself</h1>
    <p>In this week's issue, we break down self-serve growth loops...</p>
    <p><a href="https://lennysnewsletter.substack.com/p/how-to-build-a-product-that-sells-itself?utm_source=email">Read on Substack web</a></p>
  </body>
</html>
--boundary-123--
"""


class TestGmailModule(unittest.TestCase):
    def setUp(self):
        self.client = GmailClient(user="newslettermanager12@gmail.com", password="testpassword1234")

    def test_parse_email_message(self):
        email_obj = self.client.parse_email_message("msg-101", SAMPLE_SUBSTACK_RAW)

        self.assertEqual(email_obj.id, "msg-101")
        self.assertEqual(email_obj.subject, "How to build a product that sells itself")
        self.assertIn("Lenny's Newsletter", email_obj.sender_name)
        self.assertEqual(email_obj.sender_email, "newsletter@substack.com")
        self.assertIn("self-serve growth loops", email_obj.body_text)

        # Verify web URL extraction
        self.assertIsNotNone(email_obj.web_url)
        self.assertEqual(
            email_obj.web_url,
            "https://lennysnewsletter.substack.com/p/how-to-build-a-product-that-sells-itself",
        )
        self.assertEqual(email_obj.full_article_url, email_obj.web_url)

    def test_to_llm_context(self):
        email_obj = self.client.parse_email_message("msg-101", SAMPLE_SUBSTACK_RAW)
        context = email_obj.to_llm_context()

        self.assertEqual(context["email_id"], "msg-101")
        self.assertEqual(context["subject"], "How to build a product that sells itself")
        self.assertIn("self-serve growth loops", context["content_excerpt"])
        self.assertEqual(
            context["web_url"],
            "https://lennysnewsletter.substack.com/p/how-to-build-a-product-that-sells-itself",
        )

    def test_substack_digest_prompt(self):
        email_obj = self.client.parse_email_message("msg-101", SAMPLE_SUBSTACK_RAW)
        digest = SubstackDigest(emails=[email_obj])

        self.assertEqual(digest.total_emails, 1)

        prompt = digest.to_llm_prompt()
        self.assertIn("How to build a product that sells itself", prompt)
        self.assertIn("https://lennysnewsletter.substack.com/p/how-to-build-a-product-that-sells-itself", prompt)
        self.assertIn("Read Online:", prompt)

    @patch("gmail.client.imaplib.IMAP4_SSL")
    def test_fetch_substack_emails_mock(self, mock_imap):
        mock_instance = MagicMock()
        mock_imap.return_value = mock_instance
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"1"])
        mock_instance.search.return_value = ("OK", [b"101"])
        mock_instance.fetch.return_value = ("OK", [(b"101 (RFC822 {100})", SAMPLE_SUBSTACK_RAW)])

        client = GmailClient(user="newslettermanager12@gmail.com", password="testpassword1234")
        emails = client.fetch_substack_emails(limit=1)

        self.assertEqual(len(emails), 1)
        self.assertEqual(emails[0].subject, "How to build a product that sells itself")


if __name__ == "__main__":
    unittest.main()

"""Main entrypoint for Daily Bugle backend."""

from arxiv import ArxivClient, ArxivPaper


def main():
    print("Daily Bugle Backend initialized!")
    print("arxiv module is ready to query and parse research papers.")


if __name__ == "__main__":
    main()

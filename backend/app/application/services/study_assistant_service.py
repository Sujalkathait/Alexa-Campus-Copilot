from typing import Dict, Any, List
from app.schemas.study_assistant import (
    ConceptExplainResponse,
    QuizGenerateResponse,
    QuizQuestion,
    NotesSummarizeResponse
)

class StudyAssistantService:
    """Service providing AI-powered academic learning, quizzes, and revision notes."""
    
    KNOWLEDGE_BASE = {
        "virtual memory": {
            "summary": "Virtual memory is a memory management technique that provides an idealized abstraction of storage resources available on a machine, creating the illusion of a very large contiguous address space.",
            "key_points": [
                "Translates virtual addresses to physical RAM addresses via Page Tables and MMU (Memory Management Unit).",
                "Pages are transferred between RAM and secondary disk storage (swap space) as needed.",
                "Utilizes a Translation Lookaside Buffer (TLB) cache to speed up address translation.",
                "Demand paging loads pages only when referenced; page faults trigger disk fetching."
            ],
            "real_world_analogy": "Think of virtual memory like an expansive researcher's desk. Only the books and articles actively being studied sit on the physical desk (RAM), while thousands more wait on library shelves (hard drive/swap). When you need a new book, you swap it onto your desk.",
            "common_pitfalls": [
                "Thrashing: Occurs when the system spends more time swapping pages in/out than executing user instructions.",
                "Confusing internal fragmentation (wasted space within a page) with external fragmentation."
            ],
            "quick_recap": "Virtual memory separates logical address space from physical memory, offering isolation, security, and the ability to run programs larger than physical RAM."
        },
        "database normalization": {
            "summary": "Database normalization is the systematic process of organizing relational tables to reduce data redundancy, eliminate anomalies, and improve data integrity.",
            "key_points": [
                "1NF: Atomic column values, unique records with a primary key.",
                "2NF: In 1NF and no partial dependencies (all non-key attributes fully functionally dependent on the entire PK).",
                "3NF: In 2NF and no transitive functional dependencies (no non-key determines another non-key).",
                "BCNF: A stricter version of 3NF where every determinant is a superkey."
            ],
            "real_world_analogy": "Imagine maintaining a campus phonebook where student hostel rooms, advisor names, and department addresses are all typed on every course enrollment row. Normalization splits this into distinct student, course, and department directories so updating an advisor's phone number only requires 1 edit instead of 5,000.",
            "common_pitfalls": [
                "Over-normalizing: Excessive joins can degrade read performance in high-throughput analytical workloads.",
                "Violating atomicity in 1NF by storing comma-separated strings inside a single column."
            ],
            "quick_recap": "Remember the motto: 'Each non-key attribute must provide a fact about the key, the whole key, and nothing but the key, so help me Codd!'"
        },
        "dijkstra's algorithm": {
            "summary": "Dijkstra's algorithm is a greedy graph search algorithm that finds the single-source shortest paths in a directed or undirected graph with non-negative edge weights.",
            "key_points": [
                "Maintains a min-priority queue of tentative distances from the source vertex.",
                "Greedily extracts the vertex with the lowest tentative distance and relaxes its outgoing edges.",
                "Time complexity is O((V + E) log V) when implemented with a binary min-heap.",
                "Requires non-negative weights; fails on graphs with negative edge weights (Bellman-Ford is needed instead)."
            ],
            "real_world_analogy": "Think of dropping a droplet of water onto a flat porous napkin at the source node. The water steadily and uniformly expands outward in concentric ripples; the first moment a ripple contacts a destination node is guaranteed to be the shortest path.",
            "common_pitfalls": [
                "Applying Dijkstra to graphs with negative edge weights, which can lead to incorrect shortest path calculations.",
                "Forgetting to update the priority queue during edge relaxation."
            ],
            "quick_recap": "Greedy choice: pick the unvisited node with minimal distance, relax its neighbors, repeat until all vertices are visited or destination is reached."
        }
    }

    def explain_concept(self, topic: str, difficulty: str = "undergraduate") -> ConceptExplainResponse:
        t_clean = topic.lower().strip()
        matched = None
        for key in self.KNOWLEDGE_BASE:
            if key in t_clean or t_clean in key:
                matched = self.KNOWLEDGE_BASE[key]
                break

        if not matched:
            # Generic structured academic response
            return ConceptExplainResponse(
                topic=topic.title(),
                summary=f"{topic.title()} is a foundational topic in collegiate coursework requiring conceptual rigor and practical application.",
                key_points=[
                    f"Core theoretical definitions and primary axioms governing {topic.title()}.",
                    "Step-by-step algorithmic or analytical derivation of standard problems.",
                    "Practical application in modern industry and academic research.",
                    "Efficiency considerations, trade-offs, and boundary conditions."
                ],
                real_world_analogy=f"Consider {topic.title()} as a specialized modular engine component: it performs a targeted, optimized transformation within a larger interconnected system.",
                common_pitfalls=[
                    "Overlooking edge cases and initialization boundaries.",
                    "Confusing asymptotic worst-case bounds with average-case performance."
                ],
                quick_recap=f"Mastering {topic.title()} involves understanding its assumptions, step-by-step workflow, and constraint limits."
            )

        return ConceptExplainResponse(
            topic=topic.title(),
            summary=matched["summary"],
            key_points=matched["key_points"],
            real_world_analogy=matched["real_world_analogy"],
            common_pitfalls=matched["common_pitfalls"],
            quick_recap=matched["quick_recap"]
        )

    def generate_quiz(self, topic: str, num_questions: int = 3) -> QuizGenerateResponse:
        t_clean = topic.lower().strip()
        questions: List[QuizQuestion] = []

        if "database" in t_clean or "sql" in t_clean or "normal" in t_clean:
            questions = [
                QuizQuestion(
                    id=1,
                    question="Which normal form requires that all non-key attributes have no partial dependencies on the primary key?",
                    options=["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
                    correct_index=1,
                    explanation="2NF requires 1NF compliance and that every non-prime attribute is fully functionally dependent on the candidate key."
                ),
                QuizQuestion(
                    id=2,
                    question="In Boyce-Codd Normal Form (BCNF), for every functional dependency X -> Y, what must X be?",
                    options=["A foreign key", "A superkey", "A candidate non-key attribute", "A surrogate primary index"],
                    correct_index=1,
                    explanation="BCNF strictly mandates that in every non-trivial dependency X -> Y, determinant X must be a superkey."
                ),
                QuizQuestion(
                    id=3,
                    question="Which phenomenon occurs when deleting one piece of data accidentally removes other unrelated critical information?",
                    options=["Insertion Anomaly", "Deletion Anomaly", "Modification Anomaly", "Deadlock Anomaly"],
                    correct_index=1,
                    explanation="A deletion anomaly results in unintended data loss due to unnormalized composite storage."
                )
            ]
        elif "os" in t_clean or "memory" in t_clean or "operating" in t_clean:
            questions = [
                QuizQuestion(
                    id=1,
                    question="What hardware component accelerates virtual address translation to physical frame numbers?",
                    options=["Arithmetic Logic Unit (ALU)", "Translation Lookaside Buffer (TLB)", "Instruction Register (IR)", "Direct Memory Access (DMA)"],
                    correct_index=1,
                    explanation="The TLB is a high-speed associative hardware cache specifically designed for page table mappings."
                ),
                QuizQuestion(
                    id=2,
                    question="What is the condition where an operating system spends excessive time paging data in and out rather than executing user code?",
                    options=["Starvation", "Deadlock", "Thrashing", "Belady's Anomaly"],
                    correct_index=2,
                    explanation="Thrashing happens when the working sets of active processes exceed total available physical memory frames."
                ),
                QuizQuestion(
                    id=3,
                    question="Which page replacement algorithm replaces the page that will not be used for the longest period of time in the future?",
                    options=["FIFO (First In First Out)", "LRU (Least Recently Used)", "Optimal Page Replacement (OPT)", "Clock / Second Chance"],
                    correct_index=2,
                    explanation="Belady's Optimal algorithm replaces the page whose next access is furthest in the future (used as a benchmark)."
                )
            ]
        else:
            # Universal academic questions for requested topic
            questions = [
                QuizQuestion(
                    id=1,
                    question=f"What is the primary objective of studying {topic.title()} in academic curricula?",
                    options=[
                        f"To systematically model and solve computational problems in {topic.title()}",
                        "To replace standard relational schemas",
                        "To avoid any hardware memory utilization",
                        "To guarantee zero-latency execution"
                    ],
                    correct_index=0,
                    explanation=f"{topic.title()} establishes rigorous foundations for analyzing algorithmic and conceptual models."
                ),
                QuizQuestion(
                    id=2,
                    question=f"Which metric is most commonly evaluated when analyzing the efficiency of {topic.title()} methods?",
                    options=["Source file size", "Time and space asymptotic complexity", "Compiler build number", "Display refresh rate"],
                    correct_index=1,
                    explanation="Asymptotic Big-O time and space bounds are standard academic metrics for algorithmic evaluation."
                ),
                QuizQuestion(
                    id=3,
                    question=f"When encountering edge cases in {topic.title()}, what is the recommended best practice?",
                    options=[
                        "Ignore null boundaries",
                        "Establish clear base conditions and constraint invariants",
                        "Suppress exceptions silently",
                        "Allocate infinite buffer size"
                    ],
                    correct_index=1,
                    explanation="Invariants and base conditions guarantee correctness across edge inputs."
                )
            ]

        return QuizGenerateResponse(
            topic=topic.title(),
            questions=questions[:num_questions]
        )

    def summarize_notes(self, content: str, focus: str = "exam_revision") -> NotesSummarizeResponse:
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        total_words = len(content.split())
        est_minutes = max(10, min(60, total_words // 20))

        # Extract meaningful points
        bullets = []
        for line in lines[:5]:
            clean_l = line.lstrip("-*#0123456789. ")
            if len(clean_l) > 15:
                bullets.append(clean_l)

        if not bullets:
            bullets = [
                "Core definitions and foundational theory extracted from lecture material.",
                "Key equations, proofs, and structural properties to memorize for examinations.",
                "Practical sample derivations and problem-solving steps.",
                "Edge cases and common instructor traps on midterms."
            ]

        return NotesSummarizeResponse(
            title=lines[0][:60] if lines else "Lecture Summary",
            tldr=f"Condensed overview of {total_words} words formatted into high-yield revision points.",
            bullet_points=bullets,
            recommended_study_time_minutes=est_minutes
        )

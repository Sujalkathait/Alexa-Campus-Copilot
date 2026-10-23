from typing import Dict, Any

BEDROCK_CAMPUS_TOOLS: Dict[str, Any] = {
    "tools": [
        {
            "toolSpec": {
                "name": "create_assignment",
                "description": "Create a new academic assignment or homework task. Call this when the student asks to add, record, or track an assignment, paper, problem set, or project.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "The title or subject of the assignment (e.g. 'Operating Systems Lab 2', 'Math 204 Problem Set 4')"
                            },
                            "due_date": {
                                "type": "string",
                                "description": "ISO 8601 string or date/time indication for the deadline (e.g., '2026-10-25T17:00:00Z', 'tomorrow 5pm')"
                            },
                            "estimated_minutes": {
                                "type": "integer",
                                "description": "Estimated time needed to complete the task in minutes (default 60)",
                                "default": 60
                            },
                            "priority": {
                                "type": "string",
                                "enum": ["LOW", "MEDIUM", "HIGH"],
                                "description": "Priority level of the assignment based on weight or urgency",
                                "default": "MEDIUM"
                            },
                            "description": {
                                "type": "string",
                                "description": "Optional details or instructions regarding the assignment"
                            }
                        },
                        "required": ["title", "due_date"]
                    }
                }
            }
        },
        {
            "toolSpec": {
                "name": "generate_study_plan",
                "description": "Generate a proposed study schedule based on the student's pending assignments and available hours.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "available_minutes": {
                                "type": "integer",
                                "description": "Total study minutes available today or this evening (e.g. 120, 180)",
                                "default": 120
                            },
                            "strategy": {
                                "type": "string",
                                "enum": ["deadline_first", "priority_first", "workload_balance"],
                                "description": "Strategy for scheduling tasks",
                                "default": "deadline_first"
                            },
                            "save_to_schedule": {
                                "type": "boolean",
                                "description": "Whether to automatically commit the sessions to the student's calendar",
                                "default": False
                            }
                        },
                        "required": ["available_minutes"]
                    }
                }
            }
        },
        {
            "toolSpec": {
                "name": "create_reminder",
                "description": "Set a reminder notification for an upcoming assignment, exam, or study milestone.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "message": {
                                "type": "string",
                                "description": "Text reminder content (e.g., 'Submit Chemistry Lab report before midnight')"
                            },
                            "scheduled_at": {
                                "type": "string",
                                "description": "When to deliver the reminder in ISO 8601 or natural description (e.g., '2 hours before', 'tomorrow at 9am')"
                            },
                            "assignment_title": {
                                "type": "string",
                                "description": "Optional title of the assignment this reminder is linked to"
                            }
                        },
                        "required": ["message", "scheduled_at"]
                    }
                }
            }
        },
        {
            "toolSpec": {
                "name": "explain_academic_concept",
                "description": "Explain a difficult academic concept with key points, analogies, and quick review tips.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "topic": {
                                "type": "string",
                                "description": "The academic concept or topic (e.g., 'Virtual Memory', 'Dijkstra's Algorithm')"
                            },
                            "difficulty": {
                                "type": "string",
                                "enum": ["beginner", "undergraduate", "advanced"],
                                "default": "undergraduate"
                            }
                        },
                        "required": ["topic"]
                    }
                }
            }
        },
        {
            "toolSpec": {
                "name": "generate_quiz",
                "description": "Generate practice quiz questions with multiple choice options and answers for exam revision.",
                "inputSchema": {
                    "json": {
                        "type": "object",
                        "properties": {
                            "topic": {
                                "type": "string",
                                "description": "The subject or chapter to quiz on"
                            },
                            "num_questions": {
                                "type": "integer",
                                "description": "Number of questions to generate (1 to 5)",
                                "default": 3
                            }
                        },
                        "required": ["topic"]
                    }
                }
            }
        }
    ]
}

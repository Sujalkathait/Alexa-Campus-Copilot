from app.infrastructure.ai.bedrock_adapter import MockBedrockAdapter
from app.infrastructure.ai.tools_schema import BEDROCK_CAMPUS_TOOLS

def test_mock_bedrock_create_assignment_tool_call():
    adapter = MockBedrockAdapter()
    messages = [{"role": "user", "content": "Add my Operating Systems assignment due tomorrow 5 PM"}]

    res = adapter.converse(messages=messages, tool_config=BEDROCK_CAMPUS_TOOLS)
    assert len(res["tool_calls"]) == 1
    call = res["tool_calls"][0]
    assert call["name"] == "create_assignment"
    assert "Operating Systems" in call["input"]["title"]
    assert "due_date" in call["input"]
    assert res["stop_reason"] == "tool_use"

def test_mock_bedrock_missing_deadline_clarification():
    adapter = MockBedrockAdapter()
    # Missing deadline
    messages = [{"role": "user", "content": "Add my mathematics assignment"}]

    res = adapter.converse(messages=messages, tool_config=BEDROCK_CAMPUS_TOOLS)
    # The assistant asks for missing deadline rather than hallucinating
    assert res.get("action_required") is True
    assert "missing_fields" in res
    assert "due_date" in res["missing_fields"]
    assert "What date and time" in res["text"] or "What time" in res["text"]

def test_mock_bedrock_plan_study_tool_call():
    adapter = MockBedrockAdapter()
    messages = [{"role": "user", "content": "Plan my evening with 3 hours of study"}]

    res = adapter.converse(messages=messages, tool_config=BEDROCK_CAMPUS_TOOLS)
    assert len(res["tool_calls"]) == 1
    call = res["tool_calls"][0]
    assert call["name"] == "generate_study_plan"
    assert call["input"]["available_minutes"] == 180

def test_mock_bedrock_explain_concept():
    adapter = MockBedrockAdapter()
    messages = [{"role": "user", "content": "Explain the concept of Virtual Memory in OS"}]

    res = adapter.converse(messages=messages, tool_config=BEDROCK_CAMPUS_TOOLS)
    assert len(res["tool_calls"]) == 1
    call = res["tool_calls"][0]
    assert "explain" in call["name"]
    assert "Virtual Memory" in call["input"]["topic"]

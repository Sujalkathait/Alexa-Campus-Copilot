from datetime import datetime, timezone, timedelta

def test_api_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_api_assignments_crud(client):
    now = datetime.now(timezone.utc)
    # 1. Create
    payload = {
        "title": "CS201 Data Structures Lab 3",
        "description": "Implement AVL Tree balance rotations",
        "due_at": (now + timedelta(days=2)).isoformat(),
        "estimated_minutes": 75,
        "priority": "HIGH"
    }
    create_res = client.post("/api/assignments", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assignment_id = created_data["id"]
    assert created_data["title"] == payload["title"]
    assert created_data["priority"] == "HIGH"

    # 2. List
    list_res = client.get("/api/assignments")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Get single
    get_res = client.get(f"/api/assignments/{assignment_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == assignment_id

    # 4. Patch
    patch_res = client.patch(f"/api/assignments/{assignment_id}", json={"status": "IN_PROGRESS", "estimated_minutes": 90})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "IN_PROGRESS"
    assert patch_res.json()["estimated_minutes"] == 90

    # 5. Delete
    delete_res = client.delete(f"/api/assignments/{assignment_id}")
    assert delete_res.status_code == 204

def test_api_chat_create_assignment_workflow(client):
    # End-to-end chat command: student speaks/types to copilot
    payload = {
        "message": "Add my mathematics assignment due tomorrow at 5 PM",
        "timezone": "Asia/Kolkata"
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["executed_actions"]) >= 1
    action = data["executed_actions"][0]
    assert action["tool"] == "create_assignment"
    assert action["status"] == "success"

    # Verify assignment is now in database
    list_res = client.get("/api/assignments")
    assert list_res.status_code == 200
    titles = [a["title"] for a in list_res.json()]
    assert any("Mathematics" in t for t in titles)

def test_api_study_plans_generate(client):
    res = client.post("/api/study-plans/generate", json={
        "available_minutes": 120,
        "strategy": "priority_first",
        "save_to_schedule": True
    })
    assert res.status_code == 200
    data = res.json()
    assert data["strategy_used"] == "priority_first"
    assert "plan" in data

def test_api_reminders(client):
    now = datetime.now(timezone.utc) + timedelta(hours=4)
    res = client.post("/api/reminders", json={
        "message": "Study for tomorrow's quiz",
        "scheduled_at": now.isoformat()
    })
    assert res.status_code == 201
    reminder_id = res.json()["id"]

    list_res = client.get("/api/reminders")
    assert list_res.status_code == 200
    assert any(r["id"] == reminder_id for r in list_res.json())

def test_api_dashboard_summary(client):
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "user_name" in data
    assert "productivity_score" in data
    assert "urgent_assignments" in data
    assert "today_sessions" in data

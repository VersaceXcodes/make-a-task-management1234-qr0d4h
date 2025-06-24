-- Create tables
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    due_date TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    assigned_to INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    parent_task_id INTEGER REFERENCES tasks(task_id)
);

CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_members (
    project_id INTEGER NOT NULL REFERENCES projects(project_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(task_id),
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks_tags (
    task_id INTEGER NOT NULL REFERENCES tasks(task_id),
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id),
    PRIMARY KEY (task_id, tag_id)
);

-- Seed data
INSERT INTO users (email, password_hash, name, role)
VALUES 
('john.doe@example.com', 'hashed_password123', 'John Doe', 'admin'),
('jane.smith@example.com', 'hashed_password456', 'Jane Smith', 'member'),
('alex.johnson@example.com', 'hashed_password789', 'Alex Johnson', 'member'),
('emily.brown@example.com', 'hashed_password000', 'Emily Brown', 'admin');

INSERT INTO tasks (title, description, priority, created_by, assigned_to)
VALUES 
('Write a blog post', 'About the latest project milestones', 'high', 1, 2),
('Update the documentation', 'Include new features and bug fixes', 'medium', 1, 3),
('Prepare a presentation', 'For the upcoming team meeting', 'low', 4, NULL),
('Test the new feature', 'Run multiple test cases and ensure stability', 'high', 2, 2),
('Review code changes', 'Check for best practices and code quality', 'medium', 3, 1);

INSERT INTO projects (name, description, created_by)
VALUES 
('TaskMaster Development', 'Building the next-gen task management tool', 1),
('Customer Support Portal', 'Enhance the portal with new features', 2),
('Marketing Campaign', 'Plan and execute the new marketing strategy', 3);

INSERT INTO project_members (project_id, user_id)
VALUES 
(1, 1),
(1, 2),
(1, 3),
(2, 2),
(2, 4),
(3, 1),
(3, 3);

INSERT INTO comments (task_id, content, created_by)
VALUES 
(1, 'Great job on this task!', 1),
(2, 'Can you clarify this point?', 3),
(3, 'This needs more detail.', 2),
(4, 'Let me know when you''re done.', 4),
(5, 'Looks good to me.', 1);

INSERT INTO notifications (user_id, content)
VALUES 
(1, 'New task assigned to you.'),
(2, 'You have a new comment on your task.'),
(3, 'Task deadline approaching.'),
(4, 'Project update available.');

INSERT INTO tags (name, created_by)
VALUES 
('urgent', 1),
('important', 2),
('documentation', 3),
('testing', 4);

INSERT INTO tasks_tags (task_id, tag_id)
VALUES 
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 2);
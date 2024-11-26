import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [taskDate, setTaskDate] = useState(""); // Для хранения выбранной даты
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Обработчик события beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event); // Сохраняем событие для использования позже
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleAddTask = () => {
    if (task.trim() && taskDate) {
      const newTask = {
        id: Date.now(),
        text: task,
        date: taskDate,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setTask("");
      setTaskDate(""); // Сбрасываем дату после добавления
    } else {
      alert("Введите текст задачи и выберите дату!");
    }
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((result) => {
        if (result.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        setDeferredPrompt(null); // Очищаем событие после использования
      });
    }
  };

  const TaskList = ({ completedFilter }) => {
    let filteredTasks = tasks;
    if (completedFilter !== null) {
      filteredTasks = tasks.filter((task) => task.completed === completedFilter);
    }

    return (
      <ul>
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className={task.completed ? "completed" : ""}
          >
            <span>{task.text}</span>
            <span className="date">{task.date}</span>
            <button onClick={() => toggleComplete(task.id)}>
              {task.completed ? "Не выполнено" : "Выполнено"}
            </button>
            <button onClick={() => handleDelete(task.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Router>
      <div className="App">
        <h1>To-Do List</h1>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Введите задачу..."
        />
        <input
          type="date"
          value={taskDate}
          onChange={(e) => setTaskDate(e.target.value)}
        />
        <button onClick={handleAddTask}>Добавить задачу</button>

        <div>
          <Link to="/tasks">Все задачи</Link> | 
          <Link to="/tasks/completed">Выполненные задачи</Link> | 
          <Link to="/tasks/not-completed">Невыполненные задачи</Link>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/tasks" />} /> {/* Редирект на /tasks */}
          <Route path="/tasks" element={<TaskList completedFilter={null} />} />
          <Route path="/tasks/completed" element={<TaskList completedFilter={true} />} />
          <Route path="/tasks/not-completed" element={<TaskList completedFilter={false} />} />
        </Routes>

        {/* Кнопка для установки PWA, если доступна */}
        {deferredPrompt && (
          <button onClick={handleInstallClick}>Загрузить приложение</button>
        )}
      </div>
    </Router>
  );
}

export default App;

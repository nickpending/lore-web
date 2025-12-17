import { useState, useMemo } from "react";
import type { Task, TaskStatus } from "../lib/types";
import TaskCard from "./TaskCard";
import TaskFilters from "./TaskFilters";

interface Props {
  tasks: Task[];
}

const statusOrder: TaskStatus[] = ["active", "later", "done", "archived"];

export default function TasksView({ tasks }: Props) {
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Extract unique projects (excluding null), sorted alphabetically
  const allProjects = useMemo(() => {
    const projects = new Set(
      tasks.map((t) => t.project).filter((p): p is string => p !== null),
    );
    return Array.from(projects).sort();
  }, [tasks]);

  // Get statuses that exist in data, in preferred order
  const availableStatuses = useMemo(() => {
    const statuses = new Set(tasks.map((t) => t.status));
    return statusOrder.filter((s) => statuses.has(s));
  }, [tasks]);

  // Filter tasks by status and project
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(task.status)
        ) {
          return false;
        }
        // Project filter
        if (selectedProject === "__none__" && task.project !== null) {
          return false;
        }
        if (
          selectedProject &&
          selectedProject !== "__none__" &&
          task.project !== selectedProject
        ) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.captured).getTime() - new Date(a.captured).getTime(),
      );
  }, [tasks, selectedStatuses, selectedProject]);

  const handleStatusClick = (status: TaskStatus) => {
    if (!selectedStatuses.includes(status)) {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleProjectClick = (project: string) => {
    setSelectedProject(project);
  };

  return (
    <div>
      <div className="mb-8">
        <TaskFilters
          allProjects={allProjects}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          allStatuses={availableStatuses}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onProjectClick={handleProjectClick}
            onStatusClick={handleStatusClick}
          />
        ))}
      </div>
      {filteredTasks.length === 0 && (
        <p className="text-gray text-center py-12">
          No tasks match the selected filters.
        </p>
      )}
    </div>
  );
}

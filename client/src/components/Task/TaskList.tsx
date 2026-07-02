import Task from "./Task.tsx";
import type {TaskInterface} from "../../http/interfaces/TaskInterface.ts";

interface TaskListProps {
    tasks: TaskInterface[];
    onTaskDeleted: (id: number) => void;
    onTaskStatusChanged: (id: number, updatedTask: TaskInterface) => void;
}

const TaskList = ({tasks, onTaskDeleted, onTaskStatusChanged}: TaskListProps) => {
    return (
        <div style={{padding: "16px"}}>
            {tasks.length === 0 ? (
                <p style={{
                    textAlign: "center",
                    color: "#666",
                    padding: "60px 20px",
                    fontSize: "17px"
                }}>
                    Заявок не найдено.
                </p>
            ) : (
                <ul style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}>
                    {tasks.map((task) => (
                        <Task
                            key={task.id}
                            task={task}
                            onDeleted={onTaskDeleted}
                            onStatusChanged={onTaskStatusChanged}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TaskList;

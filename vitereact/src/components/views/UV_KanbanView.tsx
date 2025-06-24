import React, { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAppStore } from "@/store/main";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link } from "react-router-dom";

interface Lane {
  laneId: string;
  laneTitle: string;
  tasks: Task[];
}

interface Task {
  taskId: string;
  taskTitle: string;
  status: string;
}

const fetchKanbanData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/kanban`);
    return response.data;
  } catch (error) {
    console.error("Error fetching kanban data:", error);
    throw error;
  }
};

const addLane = async (laneTitle: string) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/lanes`, { laneTitle });
    return response.data;
  } catch (error) {
    console.error("Error adding lane:", error);
    throw error;
  }
};

const editLane = async (laneId: string, laneTitle: string) => {
  try {
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/lanes/${laneId}`, { laneTitle });
  } catch (error) {
    console.error("Error editing lane:", error);
    throw error;
  }
};

const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/tasks/${taskId}`, { status });
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

const UV_KanbanView: React.FC = () => {
  const { auth } = useAppStore();
  
  const { data: kanbanData, isLoading, refetch } = useQuery<{ lanes: Lane[] }>({
    queryKey: ["kanbanData", auth?.userId],
    queryFn: fetchKanbanData,
    enabled: !!auth,
  });

  const addLaneMutation = useMutation(({ laneTitle }: { laneTitle: string }) => addLane(laneTitle), {
    onSuccess: () => refetch(),
  });

  const editLaneMutation = useMutation(({ laneId, laneTitle }: { laneId: string; laneTitle: string }) =>
    editLane(laneId, laneTitle)
  );

  const updateTaskMutation = useMutation(({ taskId, status }: { taskId: string; status: string }) =>
    updateTaskStatus(taskId, status)
  );

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);

    socket.on("task/updated", (data: { taskId: string; updates: Partial<Task> }) => {
      refetch();
    });

    return () => socket.disconnect();
  }, []);

  const onDragEnd = (result: { destination?: { droppableId: string; index: number }; source: { index: number } }) => {
    const { destination, source } = result;

    if (!destination || destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const task = kanbanData?.lanes[source.index].tasks[source.index];
    updateTaskMutation.mutate({ taskId: task.taskId, status: destination.droppableId });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Lane Header */}
        <div className="flex justify-between items-center p-4 bg-gray-200">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <button onClick={() => addLaneMutation.mutate({ laneTitle: "New Lane" })} className="btn btn-primary">
            Add Lane
          </button>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lanes" direction="horizontal" type="LANE">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex space-x-4 p-4">
                  {kanbanData?.lanes.map((lane, laneIndex) => (
                    <Draggable key={lane.laneId} draggableId={lane.laneId} index={laneIndex}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="lane flex flex-col bg-white border border-gray-200 shadow p-4 rounded-lg w-80"
                        >
                          {/* Lane Title */}
                          <div className="flex justify-between">
                            <h2 className="text-xl font-bold">{lane.laneTitle}</h2>
                            <button
                              onClick={() =>
                                editLaneMutation.mutate({ laneId: lane.laneId, laneTitle: lane.laneTitle })
                              }
                              className="btn btn-secondary"
                            >
                              Edit Lane
                            </button>
                          </div>

                          {/* Task List */}
                          <Droppable droppableId={lane.laneId} type="TASK">
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col mt-4">
                                {lane.tasks.map((task, index) => (
                                  <Draggable key={task.taskId} draggableId={task.taskId} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="task-card p-4 my-2 bg-blue-100 rounded-lg shadow-md"
                                      >
                                        <Link to={`/tasks/${task.taskId}`}>{task.taskTitle}</Link>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </>
  );
};

export default UV_KanbanView;
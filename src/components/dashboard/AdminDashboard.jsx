import { useState, useEffect } from "react";
import {
  getUsers,
  getEstablishments,
  getActivityLogs,
} from "../../services/api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { User, Building } from "lucide-react";
import ActivityLogTimeline from "../audit/ActivityLogTimeline";

export default function AdminDashboard() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const [panels, setPanels] = useState([
    { id: "users", name: "Active Users", icon: <User size={20} /> },
    {
      id: "establishments",
      name: "Establishments",
      icon: <Building size={20} />,
    },
  ]);

  useEffect(() => {
    fetchUsers();
    fetchEstablishments();
    fetchActivityLogs();
  }, []);

  // 🔹 Users
  const fetchUsers = async () => {
    try {
      const users = await getUsers();
      const active = users.filter((u) => u.is_active);
      setActiveUsers(active);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // 🔹 Establishments
  const fetchEstablishments = async () => {
    try {
      const data = await getEstablishments();
      setEstablishments(data);
    } catch (err) {
      console.error("Error fetching establishments:", err);
    }
  };

  // 🔹 Activity Logs
  const fetchActivityLogs = async () => {
    try {
      const logs = await getActivityLogs();
      setActivityLog(logs);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    }
  };

  // 🔹 Drag panels
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(panels);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setPanels(items);
  };

  // 🔹 Render draggable panels
  const renderPanel = (panel) => {
    const panelClass =
      "bg-white border rounded p-4 flex flex-col transition-all duration-300 h-[calc(100vh-175px)]";

    switch (panel.id) {
      case "users":
        return (
          <div className={panelClass}>
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-sky-700">
              {panel.icon} {panel.name}
            </div>
            <ul className="flex-1 space-y-2 overflow-y-auto">
              {activeUsers.length > 0 ? (
                activeUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-2 transition rounded bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="text-gray-700">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {user.userlevel}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No active users found.</p>
              )}
            </ul>
          </div>
        );

      case "establishments":
        return (
          <div className={panelClass}>
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-sky-700">
              {panel.icon} {panel.name}
            </div>
            <ul className="flex-1 space-y-2 overflow-y-auto">
              {establishments.length > 0 ? (
                establishments.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between p-2 transition rounded bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="text-gray-700">{e.name}</span>
                    <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                      lat {e.latitude}, lng {e.longitude}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No establishments found.</p>
              )}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex h-[calc(100vh-158px)]">
        {/* Left: draggable panels */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard" direction="horizontal">
            {(provided) => (
              <div
                className="flex flex-1 gap-2 m-2 overflow-auto"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {panels.map((panel, index) => (
                  <Draggable
                    key={panel.id}
                    draggableId={panel.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex-1"
                      >
                        {renderPanel(panel)}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Right: timeline activity log */}
        <div className="flex-shrink-0 w-96">
          <ActivityLogTimeline activityLog={activityLog} />
        </div>
      </div>
    </>
  );
}

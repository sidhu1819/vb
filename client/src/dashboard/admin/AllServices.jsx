import { useState, useEffect } from 'react';
import { Topbar } from '../../components/dashboard/Topbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { DndContext, useDroppable, useDraggable, closestCenter, DragOverlay } from '@dnd-kit/core';
import { Loader2, MessageSquare, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLUMNS = [
  { id: 'pending', title: 'Pending' },
  { id: 'in-review', title: 'Reviewing' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Final Review' },
  { id: 'completed', title: 'Completed' }
];

const DroppableColumn = ({ id, title, children, count }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`w-80 shrink-0 bg-white/5 border rounded-2xl p-4 flex flex-col h-[calc(100vh-140px)] transition-colors ${isOver ? 'border-[#00c6ff] bg-white/10' : 'border-white/10'}`}>
       <h3 className="font-bold mb-4 flex justify-between items-center text-gray-200">
         {title} <span className="bg-[#1a1f36] px-2 py-0.5 rounded-lg text-sm text-gray-400">{count}</span>
       </h3>
       <div className="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
         {children}
       </div>
    </div>
  );
};

const DraggableCard = ({ service }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: service._id,
    data: service
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`bg-[#1a1f36] p-4 rounded-xl border border-white/10 hover:border-[#00c6ff]/50 transition-colors cursor-grab active:cursor-grabbing shadow-lg group ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm truncate pr-2 text-white group-hover:text-[#00c6ff] transition-colors">{service.title}</h4>
        <Link to={`/dashboard/admin/services/${service._id}`} target="_blank" className="text-gray-500 hover:text-white" onPointerDown={(e) => e.stopPropagation()}>
          <ExternalLink size={14} />
        </Link>
      </div>
      <p className="text-xs text-gray-400 mb-3 truncate">{service.clientId?.name || 'Unknown Client'}</p>
      
      <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-white/5">
        <span className="text-gray-500">{service.timeline}</span>
        <div className="flex items-center gap-3">
          {service.messages?.length > 0 && (
            <span className="flex items-center gap-1 text-gray-400"><MessageSquare size={12}/>{service.messages.length}</span>
          )}
          <span className="font-bold text-[#00c6ff]">{service.budget}</span>
        </div>
      </div>
    </div>
  );
};

const AllServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/admin/services');
        setServices(res.data);
      } catch (err) {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const serviceId = active.id;
    const newStatus = over.id; 
    
    let targetStatus = newStatus;
    if (!COLUMNS.find(c => c.id === newStatus)) {
       const overService = services.find(s => s._id === newStatus);
       if (overService) targetStatus = overService.status;
    }

    const service = services.find(s => s._id === serviceId);
    if (!service || service.status === targetStatus) return;

    setServices(prev => prev.map(s => s._id === serviceId ? { ...s, status: targetStatus } : s));

    try {
      await api.put(`/admin/services/${serviceId}/status`, { status: targetStatus });
      toast.success('Status updated');
    } catch(err) {
      toast.error('Update failed');
      setServices(prev => prev.map(s => s._id === serviceId ? { ...s, status: service.status } : s));
    }
  };

  const activeService = services.find(s => s._id === activeId);

  return (
    <>
      <Topbar title="Service Pipeline" />
      <div className="p-4 sm:p-8 flex-1 overflow-x-auto min-h-[calc(100vh-80px)]">
        {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#00c6ff]"/></div> : (
          <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-w-max pb-4 h-full items-start">
              {COLUMNS.map(col => (
                <DroppableColumn key={col.id} id={col.id} title={col.title} count={services.filter(s => s.status === col.id).length}>
                  {services.filter(s => s.status === col.id).map(s => (
                    <DraggableCard key={s._id} service={s} />
                  ))}
                </DroppableColumn>
              ))}
            </div>
            
            <DragOverlay>
              {activeService ? (
                <div className="bg-[#1a1f36] p-4 rounded-xl border border-[#00c6ff] shadow-2xl opacity-90 scale-105 cursor-grabbing w-80">
                  <h4 className="font-bold text-sm text-white mb-2">{activeService.title}</h4>
                  <p className="text-xs text-gray-400">{activeService.clientId?.name}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </>
  );
};
export default AllServices;

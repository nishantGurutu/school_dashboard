import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  MoreVertical,
  Maximize2,
  Search,
  Filter,
  Download,
  UserPlus,
  Calendar,
  MessageSquare,
  CheckSquare,
  GripVertical
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Initial Kanban Board Columns Data
const initialColumns = {
  todo: {
    id: 'todo',
    title: 'To do',
    items: [
      {
        id: 'task-1',
        title: 'Research for a podcast and video website',
        tag: 'Feature',
        tagType: 'feature',
        date: '8 Aug',
        comments: 12,
        checklists: '4/8',
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-2',
        title: 'Debug checkout process for the e-commerce website',
        tag: 'Bug',
        tagType: 'bug',
        checklists: '10/19',
        comments: 43,
        avatars: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-3',
        title: 'Modern living space interior architectural design layout',
        tag: 'Feature',
        tagType: 'feature',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80',
        date: '15 Aug',
        comments: 24,
        checklists: '6/6',
        avatars: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=60&q=80'
        ]
      }
    ]
  },
  doing: {
    id: 'doing',
    title: 'Doing',
    items: [
      {
        id: 'task-4',
        title: 'Design wireframes for the Aurora landing page revamp',
        tag: 'Feature',
        tagType: 'feature',
        date: '12 Aug',
        comments: 12,
        avatars: [
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-5',
        title: 'Install and set up a marketing tool for team operations',
        tag: 'Issue',
        tagType: 'issue',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
        date: '14 Aug',
        checklists: '12/20',
        comments: 14,
        avatars: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80'
        ]
      }
    ]
  },
  review: {
    id: 'review',
    title: 'Review',
    items: [
      {
        id: 'task-6',
        title: 'Create and refine logo designs for the UI brand',
        tag: 'Issue',
        tagType: 'issue',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=80',
        comments: 52,
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-7',
        title: 'Create an icon library for the project.',
        tag: 'Feature',
        tagType: 'feature',
        date: '8 Aug',
        checklists: '7/18',
        avatars: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=60&q=80'
        ]
      }
    ]
  },
  done: {
    id: 'done',
    title: 'Done',
    items: [
      {
        id: 'task-8',
        title: 'Create the Email Page layout and necessary components',
        tag: 'Feature',
        tagType: 'feature',
        comments: 43,
        avatars: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-9',
        title: 'Enhance website usability through user feedback',
        tag: 'Feature',
        tagType: 'feature',
        comments: 14,
        avatars: [
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=60&q=80',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-10',
        title: 'Kitchen island setup and interior layout review',
        tag: 'Issue',
        tagType: 'issue',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80',
        comments: 8,
        avatars: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80'
        ]
      }
    ]
  },
  rework: {
    id: 'rework',
    title: 'Rework',
    items: [
      {
        id: 'task-11',
        title: 'Blog Edit Page Modification and Playlist Page Design',
        tag: 'Feature',
        tagType: 'feature',
        date: '8 Aug',
        checklists: '7/22',
        comments: 40,
        avatars: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80'
        ]
      },
      {
        id: 'task-12',
        title: 'Plan and execute training session for new hires',
        tag: 'Issue',
        tagType: 'issue',
        image: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=500&q=80',
        date: '9 Aug',
        checklists: '5/19',
        avatars: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80'
        ]
      }
    ]
  }
};

export const KanbanBoard = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme } = useTheme();

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside list
    if (!destination) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      // Reorder in same column
      const copiedItems = Array.from(sourceCol.items);
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          items: copiedItems
        }
      });
    } else {
      // Move between columns
      const sourceItems = Array.from(sourceCol.items);
      const destItems = Array.from(destCol.items);
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destCol,
          items: destItems
        }
      });
    }
  };

  const getTagBadgeClass = (type) => {
    switch (type) {
      case 'feature':
        return 'badge-info';
      case 'bug':
        return 'badge-danger';
      case 'issue':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Kanban Header Bar */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <select
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            <option>Northern Light</option>
            <option>Aurora Core Dashboard</option>
            <option>Mobile App UI</option>
          </select>

          {/* Member Avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80'
            ].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Member"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--bg-card)',
                  marginLeft: i > 0 ? '-8px' : 0
                }}
              />
            ))}
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-8px',
                border: '2px solid var(--bg-card)'
              }}
            >
              +2
            </span>
          </div>

          <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <UserPlus size={16} /> Invite
          </button>
        </div>

        {/* Search & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            <Filter size={16} /> Filter
          </button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export / Import
          </button>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 16px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Drag & Drop Board Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            paddingBottom: '16px'
          }}
        >
          {Object.entries(columns).map(([colId, col]) => (
            <div
              key={colId}
              style={{
                flex: '0 0 320px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '650px',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{col.title}</h3>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {col.items.length}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button className="btn-icon" style={{ width: '28px', height: '28px' }}>
                    <Plus size={16} />
                  </button>
                  <button className="btn-icon" style={{ width: '28px', height: '28px' }}>
                    <MoreVertical size={16} />
                  </button>
                  <button className="btn-icon" style={{ width: '28px', height: '28px' }}>
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      backgroundColor: snapshot.isDraggingOver ? 'var(--accent-primary-light)' : 'transparent',
                      borderRadius: 'var(--radius-md)',
                      transition: 'background-color 0.2s ease',
                      padding: '4px'
                    }}
                  >
                    {col.items
                      .filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '14px',
                                boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                                cursor: 'grab',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                transition: 'transform 0.15s ease'
                              }}
                            >
                              {/* Tag Badge & Drag Handle */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className={`badge ${getTagBadgeClass(item.tagType)}`}>
                                  {item.tag}
                                </span>
                                <GripVertical size={14} color="var(--text-muted)" />
                              </div>

                              {/* Card Image preview if available */}
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt="Card preview"
                                  style={{
                                    width: '100%',
                                    height: '140px',
                                    borderRadius: 'var(--radius-md)',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}

                              {/* Title */}
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                {item.title}
                              </h4>

                              {/* Progress bar placeholder if checklists present */}
                              {item.checklists && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '4px',
                                      backgroundColor: 'var(--bg-app)',
                                      borderRadius: '2px',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: '60%',
                                        height: '100%',
                                        backgroundColor: 'var(--accent-primary)'
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Footer Details */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {item.date && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Calendar size={12} /> {item.date}
                                    </span>
                                  )}
                                  {item.checklists && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <CheckSquare size={12} /> {item.checklists}
                                    </span>
                                  )}
                                  {item.comments && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <MessageSquare size={12} /> {item.comments}
                                    </span>
                                  )}
                                </div>

                                {/* Assigned Avatars */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {item.avatars?.map((av, ai) => (
                                    <img
                                      key={ai}
                                      src={av}
                                      alt="Assigned"
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '2px solid var(--bg-card)',
                                        marginLeft: ai > 0 ? '-6px' : 0
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

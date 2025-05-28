import * as React from 'react';

interface Task {
  title: string;
  date?: string;
  priority?: string;
  completed?: boolean;
}

interface EmailTemplateProps {
  firstName: string;
  tasks: Task[];
  type: 'reminder' | 'overdue';
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  tasks,
  type
}) => (
  <div style={{ 
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    color: '#333'
  }}>
    <div style={{ 
      background: type === 'overdue' ? '#FEE2E2' : '#E0F2FE', 
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h1 style={{ 
        color: type === 'overdue' ? '#DC2626' : '#0369A1',
        fontSize: '24px',
        margin: '0 0 16px 0'
      }}>
        {type === 'overdue' ? 'Overdue Tasks' : 'Task Reminders'}
      </h1>
      <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
        Hello {firstName},
        <br />
        {type === 'overdue' 
          ? 'You have the following overdue tasks that need your attention:' 
          : 'Here are your upcoming tasks that are due soon:'}
      </p>
    </div>
    
    <div>
      {tasks.length > 0 ? (
        <ul style={{ 
          listStyle: 'none',
          padding: '0',
          margin: '0'
        }}>
          {tasks.map((task, index) => (
            <li key={index} style={{ 
              padding: '12px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{ 
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid #ccc',
                marginRight: '12px',
                backgroundColor: task.completed ? '#10B981' : 'transparent'
              }} />
              <div style={{ flex: '1' }}>
                <div style={{ 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  {task.title}
                </div>
                {task.date && (
                  <div style={{ 
                    fontSize: '14px',
                    color: type === 'overdue' ? '#DC2626' : '#6B7280'
                  }}>
                    Due: {new Date(task.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
                {task.priority && (
                  <div style={{ 
                    fontSize: '12px',
                    color: '#fff',
                    backgroundColor: 
                      task.priority === 'high' ? '#DC2626' : 
                      task.priority === 'medium' ? '#F59E0B' : '#10B981',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginTop: '4px'
                  }}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', color: '#6B7280' }}>
          No {type === 'overdue' ? 'overdue' : 'upcoming'} tasks at the moment.
        </p>
      )}
    </div>
    
    <div style={{ 
      marginTop: '24px',
      padding: '16px',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#6B7280',
      textAlign: 'center'
    }}>
      <p>
        Visit your <a 
          href="https://your-todo-app.com/dashboard" 
          style={{ color: '#0369A1', textDecoration: 'none' }}
        >
          dashboard
        </a> to manage your tasks.
      </p>
      <p style={{ marginTop: '8px', fontSize: '12px' }}>
        You&apos;re receiving this email because you have tasks in your To-Do List app.
      </p>
    </div>
  </div>
);
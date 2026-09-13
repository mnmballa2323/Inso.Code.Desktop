import { useState, useRef, useEffect } from 'react';
import './index.css';
import { invoke } from '@tauri-apps/api/core';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize Sovereign Bedrock + Greengrass Edge on boot
    invoke('initialize_sovereign_bedrock').catch(console.error);
    
    const interval = setInterval(() => {
      invoke('get_swarm_telemetry').then((res) => setTelemetry(res)).catch(console.error);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !isStreaming) {
      const userMessage = prompt;
      setPrompt('');

      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsStreaming(true);
      
      setMessages(prev => [...prev, { role: 'assistant', content: 'Processing via Hybrid Edge-to-Cloud ML...' }]);

      try {
        const result = await invoke('execute_agent_mission', { missionId: Date.now().toString(), command: userMessage });
        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = result as string;
          return newMsg;
        });
      } catch (err) {
        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = `System Halt: ${err}`;
          return newMsg;
        });
      } finally {
        setIsStreaming(false);
      }
    }
  };

  return (
    <div className="layout">
      {/* Titlebar / Window Chrome */}
      <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>
        <div className="titlebar-title" data-tauri-drag-region>
          AWS GREENGRASS EDGE CLUSTER — CLAUDE 5 SONNET
        </div>
        <div className="titlebar-status">
          <div className={`status-dot ${telemetry?.status === 'flawless' ? 'active' : ''}`}></div>
          <span className="mono-text">{telemetry?.sovereign_plane || 'INITIALIZING'}</span>
        </div>
      </div>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2 className="serif-title">Live Execution Matrix</h2>
          </div>
          
          <div className="telemetry-grid">
            <div className="telemetry-box highlight">
              <span className="t-label">EDGE ML COMPUTE (GPU)</span>
              <span className="t-val accent">{telemetry?.edge_compute || 'IDLE'}</span>
              <div className="progress-bar"><div className="fill" style={{width: '78%'}}></div></div>
            </div>
            
            <div className="telemetry-box highlight">
              <span className="t-label">AWS BEDROCK CLOUD</span>
              <span className="t-val">{telemetry?.bedrock_connectivity || 'STANDBY'}</span>
              <div className="progress-bar"><div className="fill" style={{width: '34%'}}></div></div>
            </div>
          </div>
          
          <ul className="mission-list">
            <li className="mission-item active">
              <span className="mission-title">Continuous Vision Sync</span>
              <span className="mission-meta">60 FPS Local GPU</span>
            </li>
            <li className="mission-item">
              <span className="mission-title">AWS SageMaker Sync</span>
              <span className="mission-meta">Model Weights Optimal</span>
            </li>
          </ul>
          
          <div className="sidebar-footer">
            <div className="telemetry-box">
              <div className="t-row"><span className="t-label">EDGE LATENCY</span><span className="t-val">{telemetry?.edge_latency || '--'}</span></div>
              <div className="t-row"><span className="t-label">CLOUD LATENCY</span><span className="t-val">{telemetry?.cloud_latency || '--'}</span></div>
              <div className="t-row"><span className="t-label">OS CLEARANCE</span><span className="t-val">{telemetry?.local_hands_clearance || '--'}</span></div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h1 className="serif-title large">Physical Hardware Bridged.</h1>
                <p className="empty-subtitle">Local GPU and AWS Bedrock are synchronized. You have absolute OS control.</p>
                <div className="bento-grid">
                  <div className="bento-card" onClick={() => setPrompt('Execute high-speed local UI extraction')}>
                    <h3>Scrape Local Application</h3>
                    <p>Trigger 60 FPS Edge Vision</p>
                  </div>
                  <div className="bento-card" onClick={() => setPrompt('Run complex financial model manipulation')}>
                    <h3>Execute Macro OS Actions</h3>
                    <p>Leverage Claude 5 Orchestration</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`message-row ${msg.role}`}>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="input-area">
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Inject command into the Edge-Cloud matrix..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleSubmit}
              autoFocus
            />
            <div className="input-hint">
              Press <kbd>Enter</kbd> to execute on BARE METAL
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

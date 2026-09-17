import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import './index.css';

// 3D Neural Swarm Component
function SwarmNode({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} position={position} args={[0.4, 32, 32]}>
      <MeshDistortMaterial color={color} envMapIntensity={1} clearcoat={1} clearcoatRoughness={0} metalness={0.8} roughness={0.2} distort={0.4} speed={speed} />
    </Sphere>
  );
}

function HolographicSwarm({ activeNodes }: { activeNodes: number }) {
  const nodes = Array.from({ length: activeNodes }).map((_, i) => ({
    position: [
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2
    ] as [number, number, number],
    color: i === 0 ? '#00FF9D' : '#1F6C9F',
    speed: Math.random() * 2 + 1
  }));

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <pointLight position={[-10, -10, -5]} color="#00FF9D" intensity={2} />
      {nodes.map((node, i) => (
        <SwarmNode key={i} position={node.position} color={node.color} speed={node.speed} />
      ))}
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
    </Canvas>
  );
}

export default function App() {
  const [mode, setMode] = useState<'work' | 'code'>('work');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeNodes, setActiveNodes] = useState(3);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    invoke('initialize_sovereign_azure_openai').catch(console.error);
    
    const interval = setInterval(() => {
      invoke('get_swarm_telemetry').then((res) => setTelemetry(res)).catch(console.error);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !isStreaming) {
      const userMessage = prompt;
      setPrompt('');
      setActiveNodes(prev => Math.min(prev + 2, 12)); // Spin up nodes dynamically

      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsStreaming(true);
      
      const statusMsg = mode === 'work' 
        ? 'Engaging Sovereign OS Computer-Use & Document Intelligence Agent...' 
        : 'Spinning up Azure GPT-6 Astra DevFleet compiler swarm...';
      setMessages(prev => [...prev, { role: 'assistant', content: statusMsg }]);

      try {
        const payload = `[${mode.toUpperCase()}] ${userMessage}`;
        const result = await invoke('execute_agent_mission', { missionId: Date.now().toString(), command: payload });
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
        setActiveNodes(3); // Cool down nodes
      }
    }
  };

  return (
    <div className="layout">
      {/* Titlebar / Window Chrome with Work / Code Mode Switcher */}
      <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="titlebar-mode-toggle">
          <button 
            type="button"
            className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
            onClick={() => setMode('work')}
          >
            💼 WORK
          </button>
          <button 
            type="button"
            className={`mode-btn ${mode === 'code' ? 'active' : ''}`}
            onClick={() => setMode('code')}
          >
            ⚡ CODE
          </button>
        </div>

        <div className="titlebar-title" data-tauri-drag-region>
          {mode === 'work' ? 'INSO WORK // NON-TECHNICAL DESKTOP AGENT' : 'INSO CODE // BARE-METAL COMPILER SWARM'}
        </div>

        <div className="titlebar-status">
          <div className={`status-dot ${telemetry?.status === 'flawless' ? 'active' : ''}`}></div>
          <span className="mono-text">{telemetry?.sovereign_plane || 'INITIALIZING'}</span>
        </div>
      </div>

      <div className="main-container">
        {/* Holographic Neural Swarm UI */}
        <aside className="sidebar visual-sidebar">
          <div className="sidebar-header">
            <h2 className="serif-title">{mode === 'work' ? 'OS Agent Substrate' : 'Neural Swarm Topology'}</h2>
          </div>
          
          <div className="hologram-container">
            <HolographicSwarm activeNodes={activeNodes} />
            <div className="hologram-overlay">
              <span className="overlay-text">{mode === 'work' ? 'VISION ARRAY: 2 MONITORS' : `ACTIVE NODES: ${activeNodes}`}</span>
              <span className="overlay-text highlight">{mode === 'work' ? 'VAULT: ENCRYPTED PDF/OCR' : 'OS VECTOR INDEX: 142.1M HASHES'}</span>
            </div>
          </div>
          
          <div className="telemetry-grid">
            <div className="telemetry-box highlight">
              <span className="t-label">{mode === 'work' ? 'OS VISION (0ms XCAP)' : 'EDGE ML COMPUTE (GPU)'}</span>
              <span className="t-val accent">{mode === 'work' ? 'BARE_METAL_ROOT' : (telemetry?.edge_compute || 'IDLE')}</span>
              <div className="progress-bar"><div className="fill" style={{width: isStreaming ? '95%' : '12%'}}></div></div>
            </div>
            
            <div className="telemetry-box highlight">
              <span className="t-label">{mode === 'work' ? 'DOCUMENT VAULT' : 'AZURE CLOUD MESH'}</span>
              <span className="t-val">{mode === 'work' ? 'PII_SCRUBBED_LOCAL' : (telemetry?.memory_vault || 'STANDBY')}</span>
              <div className="progress-bar"><div className="fill" style={{width: isStreaming ? '88%' : '4%'}}></div></div>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                {mode === 'work' ? (
                  <>
                    <h1 className="serif-title large">Computer Use. Document Intelligence.</h1>
                    <p className="empty-subtitle">Operate desktop applications, parse contracts, build financial models, and automate non-technical workflows without writing code.</p>
                    <div className="bento-grid">
                      <div className="bento-card" onClick={() => setPrompt('Parse 100-page enterprise financial PDF and extract tabular metrics')}>
                        <h3>Document Vault Ingestion</h3>
                        <p>100% local OCR & PII anonymization</p>
                      </div>
                      <div className="bento-card" onClick={() => setPrompt('Execute multi-step browser market research and create spreadsheet model')}>
                        <h3>Headless Browser Automation</h3>
                        <p>Web scraping and formula generation</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="serif-title large">Beyond Chat. Absolute OS Sovereignty.</h1>
                    <p className="empty-subtitle">Azure GPT-6 Astra Code is a CLI. Cowork is a webpage. This is a BARE METAL operating system orchestrator.</p>
                    <div className="bento-grid">
                      <div className="bento-card" onClick={() => setPrompt('Index entire macOS filesystem locally and run AST analysis')}>
                        <h3>Global OS Vector Index</h3>
                        <p>Instant symbol search and dependency trees</p>
                      </div>
                      <div className="bento-card" onClick={() => setPrompt('Dispatch DevFleet swarm to generate full test suite (>85% coverage)')}>
                        <h3>DevFleet Swarm TDD</h3>
                        <p>Automated regression tests in Docker sandboxes</p>
                      </div>
                    </div>
                  </>
                )}
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
              placeholder={mode === 'work' ? "Command the Work Agent (e.g. 'Extract revenue from contract PDF')..." : "Command the Code Agent (e.g. 'Refactor repository and run LSP diagnostics')..."} 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleSubmit}
              autoFocus
            />
            <div className="input-hint">
              Press <kbd>Enter</kbd> to execute on BARE METAL ({mode.toUpperCase()} MODE)
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

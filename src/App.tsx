import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import Editor, { DiffEditor, useMonaco } from '@monaco-editor/react';
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
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeNodes, setActiveNodes] = useState(3);
  const [code, setCode] = useState<string>('// Welcome to Inso Code Agent\n// We are now running Azure Copilot Engine + Composer Mode.\n\nfunction calculateEncryption() {\n  \n}\n');
  const [composerCode, setComposerCode] = useState<string>('// Welcome to Inso Code Agent\n// We are now running Azure Copilot Engine + Composer Mode.\n\nfunction calculateEncryption() {\n  const vault = new AzureKeyVault();\n  return vault.encrypt("sovereign_data");\n}\n');
  const [viewMode, setViewMode] = useState<'editor' | 'diff'>('editor');
  // @ts-ignore
  const [editorLanguage, setEditorLanguage] = useState<string>('typescript');
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const monaco = useMonaco();

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

  // Copilot Ghost Text Provider
  useEffect(() => {
    if (monaco) {
      const provider = monaco.languages.registerInlineCompletionsProvider('typescript', {
        // @ts-ignore
        provideInlineCompletions: async (model, position, context, token) => {
          // In production, this invokes the fast local Codex/ONNX runtime or Azure OpenAI.
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });
          
          if (textUntilPosition.trim() === 'function calculateEncryption() {') {
            return {
              items: [{
                insertText: '\n  const vault = new AzureKeyVault();\n  return vault.encrypt("sovereign_data");\n}',
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
              }]
            };
          }
          return { items: [] };
        },
      });
      return () => provider.dispose();
    }
  }, [monaco]);

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim() && !isStreaming) {
      const userMessage = prompt;
      setPrompt('');
      setActiveNodes(prev => Math.min(prev + 2, 12));

      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsStreaming(true);
      
      setMessages(prev => [...prev, { role: 'assistant', content: 'Activating Azure Composer Engine...' }]);

      try {
        const payload = `[COMPOSER] ${userMessage}`;
        await invoke('execute_agent_mission', { missionId: Date.now().toString(), command: payload });
        
        // Simulating the Composer generating a diff.
        setViewMode('diff');
        setComposerCode(`// Auto-generated by Azure Copilot Composer\n\n${userMessage}\n\nfunction calculateEncryption() {\n  const vault = new AzureKeyVault();\n  return vault.encrypt("sovereign_data");\n}`);

        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1].content = "Composer generated changes. Review the diff pane.";
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
        setActiveNodes(3);
      }
    }
  };

  return (
    <div className="layout">
      {/* Titlebar */}
      <div data-tauri-drag-region className="titlebar">
        <div className="titlebar-controls">
          <div className="control close"></div>
          <div className="control minimize"></div>
          <div className="control maximize"></div>
        </div>

        <div className="titlebar-title" data-tauri-drag-region>
          INSO CODE / AZURE COPILOT
        </div>

        <div className="titlebar-status">
          <div className={`status-dot ${telemetry?.status === 'flawless' ? 'active' : ''}`}></div>
          <span className="mono-text">{telemetry?.sovereign_plane || 'INITIALIZING'}</span>
        </div>
      </div>

      <div className="main-container">
        {/* Editor Area (Monaco) */}
        <div className="editor-area" style={{ flex: 1, backgroundColor: '#1e1e1e', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
            <div className="editor-tabs" style={{ display: 'flex', background: '#252526', padding: '10px 15px', gap: '10px' }}>
                <button 
                  onClick={() => setViewMode('editor')}
                  style={{ background: viewMode === 'editor' ? '#1e1e1e' : 'transparent', color: viewMode === 'editor' ? '#fff' : '#888', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
                  main.ts
                </button>
                <button 
                  onClick={() => setViewMode('diff')}
                  style={{ background: viewMode === 'diff' ? '#1e1e1e' : 'transparent', color: viewMode === 'diff' ? '#00FF9D' : '#888', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
                  Composer Diff
                </button>
            </div>
            
            {viewMode === 'editor' ? (
              <Editor 
                  height="100%" 
                  theme="vs-dark" 
                  language={editorLanguage} 
                  value={code} 
                  onChange={(val) => setCode(val || '')} 
                  options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'Geist Mono', 'Fira Code', monospace",
                      padding: { top: 20 },
                      inlineSuggest: { enabled: true }
                  }}
              />
            ) : (
              <DiffEditor 
                  height="100%" 
                  theme="vs-dark" 
                  language={editorLanguage} 
                  original={code}
                  modified={composerCode}
                  options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "'Geist Mono', 'Fira Code', monospace",
                      renderSideBySide: true,
                      readOnly: true
                  }}
              />
            )}
        </div>

        {/* Chat Area */}
        <main className="chat-area" style={{ flex: '0 0 450px', display: 'flex', flexDirection: 'column' }}>
          <div className="hologram-container" style={{ height: '180px', flexShrink: 0, borderBottom: '1px solid #2a2a2a' }}>
            <HolographicSwarm activeNodes={activeNodes} />
            <div className="hologram-overlay">
              <span className="overlay-text">{`ACTIVE NODES: ${activeNodes}`}</span>
            </div>
          </div>

          <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <h1 className="serif-title large" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Azure Copilot</h1>
                <p className="empty-subtitle">Instruct the Composer. Press Tab for Inline Ghost Text.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`message-row ${msg.role}`} style={{ marginBottom: '15px' }}>
                  <div className="message-content" style={{ padding: '10px 14px', borderRadius: '8px', background: msg.role === 'user' ? '#2b2d31' : '#1e1e1e', border: msg.role === 'assistant' ? '1px solid #00FF9D40' : 'none', color: '#e0e0e0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="input-area" style={{ padding: '20px', borderTop: '1px solid #2a2a2a' }}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask Copilot Composer to rewrite this logic..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleSubmit}
              autoFocus
              style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', color: '#fff', outline: 'none' }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

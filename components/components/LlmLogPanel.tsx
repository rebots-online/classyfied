/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { LlmInteraction } from '@/App'; // Assuming LlmInteraction is exported from App.tsx
import { GenerateContentParameters, GenerateContentResponse, GroundingChunk } from '@google/genai';

interface LlmLogPanelProps {
  interactions: LlmInteraction[];
  onClearLog: () => void;
}

const LlmLogPanel: React.FC<LlmLogPanelProps> = ({ interactions, onClearLog }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [displayedInteractions, setDisplayedInteractions] = useState<LlmInteraction[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process interactions with time-based batching for TOKEN entries
  useEffect(() => {
    const result: LlmInteraction[] = [];
    let tokenBuffer = '';
    let lastTokenInteraction: LlmInteraction | null = null;

    for (const interaction of interactions) {
      if (interaction.type === 'TOKEN') {
        if (!lastTokenInteraction) {
          lastTokenInteraction = { ...interaction, data: '' };
          result.push(lastTokenInteraction);
        }
        tokenBuffer += interaction.data;
        lastTokenInteraction.data = tokenBuffer;
      } else {
        result.push(interaction);
        tokenBuffer = '';
        lastTokenInteraction = null;
      }
    }

    // Update display with throttling
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = setTimeout(() => {
      setDisplayedInteractions(result);
    }, 1500); // Update every 1.5 seconds

    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [interactions]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedInteractions]);

  const formatTimestamp = (isoTimestamp: string) => {
    return new Date(isoTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const renderInteractionData = (interaction: LlmInteraction) => {
    if (!interaction.data) {
      return <pre>No data available.</pre>;
    }

    try {
      switch (interaction.type) {
        case 'PROMPT':
          const request = interaction.data as GenerateContentParameters;
          return (
            <div>
              <strong>Model:</strong> {interaction.model || request.model || 'N/A'}
              <pre>{JSON.stringify(request.contents, null, 2)}</pre>
              {request.config && (
                <>
                  <strong>Config:</strong>
                  <pre>{JSON.stringify(request.config, null, 2)}</pre>
                </>
              )}
              {/* Access safetySettings from config object */}
              {request.config?.safetySettings && (
                <>
                  <strong>Safety Settings:</strong>
                  <pre>{JSON.stringify(request.config.safetySettings, null, 2)}</pre>
                </>
              )}
            </div>
          );
        case 'RESPONSE':
          const response = interaction.data as GenerateContentResponse;
           const text = response.text; // Access via .text
           const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
          return (
            <div>
              <strong>Model:</strong> {interaction.model || 'N/A'}
              <pre>{text || "No text in response."}</pre>
              {response.promptFeedback && (
                 <div><strong>Prompt Feedback:</strong> <pre>{JSON.stringify(response.promptFeedback, null, 2)}</pre></div>
              )}
              {response.candidates?.[0]?.finishReason && (
                 <div><strong>Finish Reason:</strong> {response.candidates[0].finishReason}</div>
              )}
              {response.candidates?.[0]?.safetyRatings && response.candidates[0].safetyRatings.length > 0 && (
                <div><strong>Safety Ratings:</strong> <pre>{JSON.stringify(response.candidates[0].safetyRatings, null, 2)}</pre></div>
              )}
              {groundingMetadata && groundingMetadata.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
                <div className="grounding-metadata-log">
                  <strong>Grounding Chunks:</strong>
                  <ul>
                    {groundingMetadata.groundingChunks.map((chunk: GroundingChunk, index: number) => (
                      (chunk.web && chunk.web.uri) && (
                        <li key={index}>
                          <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer">
                            {chunk.web.title || chunk.web.uri}
                          </a>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        case 'TOKEN':
          return <pre className="token-entry">{interaction.data}</pre>;
        case 'ERROR':
          const error = interaction.data as Error;
          return (
            <div>
              <strong>Model:</strong> {interaction.model || 'N/A'}
              <pre>{error.message || JSON.stringify(interaction.data, null, 2)}</pre>
              {error.stack && <pre className="error-stack">{error.stack}</pre>}
            </div>
          );
        default:
          return <pre>{JSON.stringify(interaction.data, null, 2)}</pre>;
      }
    } catch (e) {
      console.error("Error rendering interaction data:", e);
      return <pre>Error displaying data. Check console.</pre>;
    }
  };

  return (
    <div className="llm-log-panel">
      <div className="llm-log-header">
        <h3>LLM Interaction Log</h3>
        <button onClick={onClearLog} className="button-secondary clear-log-button">
          Clear Log
        </button>
      </div>
      <div className="llm-log-entries">
        {displayedInteractions.length === 0 && <p className="empty-log-message">No interactions yet.</p>}
        {displayedInteractions.map((interaction, index) => (
          <div key={interaction.id + '_' + index} className={`log-entry log-entry-${interaction.type.toLowerCase()}`}>
            <div className="log-entry-meta">
              <span className="log-entry-timestamp">{formatTimestamp(interaction.timestamp)}</span>
              <span className="log-entry-type">{interaction.type}</span>
            </div>
            <div className="log-entry-data">
              {renderInteractionData(interaction)}
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LlmLogPanel;
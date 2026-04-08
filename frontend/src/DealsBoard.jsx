import { useState } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const stages = [
  "New Lead",
  "Proposal Sent",
  "Site Survey",
  "Closed Won",
  "Closed Lost",
];

const stageWeights = {
  "New Lead": 0.1,
  "Proposal Sent": 0.4,
  "Site Survey": 0.5,
  "Closed Won": 1,
  "Closed Lost": 0,
};

const initialDeals = [
  { id: "1", name: "Tom Johnson", amount: 10000, stage: "New Lead" },
  { id: "2", name: "Alex Owen", amount: 22000, stage: "Proposal Sent" },
  { id: "3", name: "Matthew Whites", amount: 70000, stage: "Site Survey" },
  { id: "4", name: "Gordon Millers", amount: 50000, stage: "Closed Won" },
];

function formatMoney(value) {
  return `$${value.toLocaleString()}`;
}

function DealCard({ deal }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "white",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "grab",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{deal.name}</strong>
      <div>{formatMoney(deal.amount)}</div>
    </div>
  );
}

function Column({ stage, deals }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const weight = stageWeights[stage] ?? 0;
  const weightedAmount = Math.round(totalAmount * weight);

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        background: isOver ? "#dde7f5" : "#e9edf5",
        padding: "10px",
        borderRadius: "10px",
        minHeight: "520px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{stage}</h3>

      <div style={{ flex: 1 }}>
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
      </div>

      <div
        style={{
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px solid #cfd8e3",
          fontSize: "14px",
          color: "#243b53",
          lineHeight: 1.5,
        }}
      >
        <div>
          <strong>{formatMoney(totalAmount)}</strong> | Total amount
        </div>

        {stage === "Closed Won" ? (
          <div>
            <strong>Won (100%)</strong>
          </div>
        ) : stage === "Closed Lost" ? (
          <div>
            <strong>Lost</strong>
          </div>
        ) : (
          <div>
            <strong>{formatMoney(weightedAmount)}</strong> ({Math.round(weight * 100)}%) | Weighted amount
          </div>
        )}
      </div>
    </div>
  );
}

export default function DealsBoard() {
  const [deals, setDeals] = useState(initialDeals);

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    let newStage = null;

    // Case 1: dropped directly on a column
    if (stages.includes(String(over.id))) {
      newStage = String(over.id);
    } else {
      // Case 2: dropped on another card
      const targetDeal = deals.find((deal) => deal.id === String(over.id));
      if (targetDeal) {
        newStage = targetDeal.stage;
      }
    }

    if (!newStage) return;

    setDeals((prevDeals) =>
      prevDeals.map((deal) =>
        deal.id === String(active.id) ? { ...deal, stage: newStage } : deal
      )
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          background: "#f5f7fb",
          minHeight: "100vh",
        }}
      >
        {stages.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            deals={deals.filter((deal) => deal.stage === stage)}
          />
        ))}
      </div>
    </DndContext>
  );
}
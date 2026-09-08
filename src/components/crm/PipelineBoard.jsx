import React, { useEffect, useState } from 'react'
import { dataService, STAGES } from '../../services/dataService'
import Skeleton from '../ui/Skeleton'
import DealCard from './DealCard'

export default function PipelineBoard() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragOverStage, setDragOverStage] = useState(null)

  useEffect(() => {
    dataService.getDeals().then((res) => {
      setDeals(res)
      setLoading(false)
    })
  }, [])

  const handleDrop = async (e, stageId) => {
    e.preventDefault()
    setDragOverStage(null)
    const dealId = e.dataTransfer.getData('dealId')
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: stageId, daysInStage: 0 } : d)))
    await dataService.updateDealStage(dealId, stageId)
  }

  const visibleStages = STAGES.filter((s) => s.id !== 'lost')

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {visibleStages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id)
          const total = stageDeals.reduce((s, d) => s + d.value, 0)
          return (
            <div
              key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id) }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => handleDrop(e, stage.id)}
              className={`w-72 shrink-0 rounded-xl2 p-3 transition-colors ${dragOverStage === stage.id ? 'bg-primary-light' : 'bg-canvas'}`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-semibold text-ink">{stage.label}</span>
                  <span className="text-xs text-subink">({stageDeals.length})</span>
                </div>
              </div>
              <p className="text-xs text-subink px-1 mb-3">${total.toLocaleString()} total</p>
              <div className="min-h-[60px]">
                {loading && <Skeleton className="h-20 w-full mb-2" />}
                {!loading && stageDeals.length === 0 && (
                  <div className="border border-dashed border-line rounded-lg py-6 text-center text-xs text-subink">Drop a deal here</div>
                )}
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={(e, id) => e.dataTransfer.setData('dealId', id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

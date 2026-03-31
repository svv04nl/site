'use client'

import React, { createContext, useContext } from 'react'

type TeamContextValue = {
  teamcode: number | null
  slug: string
}

const TeamContext = createContext<TeamContextValue>({ teamcode: null, slug: '' })

export function TeamProvider({
  teamcode,
  slug,
  children,
}: TeamContextValue & { children: React.ReactNode }) {
  return <TeamContext.Provider value={{ teamcode, slug }}>{children}</TeamContext.Provider>
}

export function useTeam() {
  return useContext(TeamContext)
}

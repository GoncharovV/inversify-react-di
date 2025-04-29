import React from 'react';
import { interfaces } from 'inversify';


type InversifyReactContextValue = interfaces.Container | null;

export const InversifyContext = React.createContext<InversifyReactContextValue>(null);

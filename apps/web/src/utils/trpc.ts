import type {AppRouter} from "../../../../packages/lib/trpc";
import {createTRPCContext} from "@trpc/tanstack-react-query";
// import { createTRPCReact } from '@trpc/react-query';

export const {TRPCProvider, useTRPC, useTRPCClient} = createTRPCContext<AppRouter>();
// export const trpc = createTRPCReact<AppRouter>();
// export const TRPCProvider = trpc.Provider;

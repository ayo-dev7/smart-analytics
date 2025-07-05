"use client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useState } from "react";
import type {AppRouter} from "../../../../packages/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {TRPCProvider} from "../utils/trpc";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            }
        }
    })
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if(typeof window === 'undefined') {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if(!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient
    }
}

interface ChildrenProp {
    children: React.ReactNode;
}

export default function Providers({children}:ChildrenProp) {
    const queryClient = getQueryClient();
    const [trpcClient] = useState(() => {
        return createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: "http://localhost:9001/trpc"
                })
            ]
        })
    });

    return (
        <QueryClientProvider client={queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {children}
            </TRPCProvider>
        </QueryClientProvider>
    )
}
"use client";
import { useTRPC } from "../utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function Index() {
  const trpc = useTRPC();
  const healthQuery = useQuery(trpc.health.queryOptions());
  // const health = trpc.health.useQuery();


  return (
    <div>
      Hello world!
      <p>{healthQuery.data?.status}</p>
      <p>{healthQuery.data?.timestamp}</p>
    </div>
  );
};

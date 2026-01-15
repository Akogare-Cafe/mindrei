/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as cache from "../cache.js";
import type * as collaboration from "../collaboration.js";
import type * as edges from "../edges.js";
import type * as exportImport from "../exportImport.js";
import type * as liveSession from "../liveSession.js";
import type * as mindMaps from "../mindMaps.js";
import type * as nodes from "../nodes.js";
import type * as rateLimit from "../rateLimit.js";
import type * as subscriptions from "../subscriptions.js";
import type * as topicInsights from "../topicInsights.js";
import type * as transcriptions from "../transcriptions.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  cache: typeof cache;
  collaboration: typeof collaboration;
  edges: typeof edges;
  exportImport: typeof exportImport;
  liveSession: typeof liveSession;
  mindMaps: typeof mindMaps;
  nodes: typeof nodes;
  rateLimit: typeof rateLimit;
  subscriptions: typeof subscriptions;
  topicInsights: typeof topicInsights;
  transcriptions: typeof transcriptions;
  usage: typeof usage;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

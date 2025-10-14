declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export type Handler = (req: Request) => Response | Promise<Response>;
  export function serve(handler: Handler): void;
}

declare module "https://deno.land/x/imagescript@1.2.15/mod.ts" {
  export class Image {
    static RESIZE_AUTO: number;
    static decode(buffer: ArrayBuffer): Promise<Image>;
    resize(width: number, height?: number): Image;
    encode(quality?: number): Promise<Uint8Array>;
  }
}

declare module "https://esm.sh/@supabase/supabase-js@2.44.4" {
  export * from "@supabase/supabase-js";
}

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

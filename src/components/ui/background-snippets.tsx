import { cn } from "@/lib/utils";

interface BackgroundProps {
    className?: string;
}

export const DarkModeBackground = ({ className }: BackgroundProps) => {
    return (
        <div className={cn("fixed inset-0 -z-20 h-full w-full bg-slate-950 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:6rem_4rem]", className)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(100,50,255,0.12),transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_560px_at_50%_200px,rgba(82,82,82,0.6),transparent)]"></div>
        </div>
    );
};

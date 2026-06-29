"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { joinSession } from "@/lib/api/sessions";
import { JitsiEmbed } from "@/components/sessions/JitsiEmbed";
import { toastError } from "@/lib/toast";

type JitsiInfo = {
    jitsi_jwt: string;
    jitsi_room: string;
};

export default function SessionRoomPage({
    params,
}: {
    params: Promise<{ sessionId: string }>;
}) {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [jitsi_info, setJitsiInfo] = useState<JitsiInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        params.then((p) => setSessionId(p.sessionId));
    }, [params]);

    useEffect(() => {
        if (authLoading || !user || !sessionId) return;

        setLoading(true);
        setFailed(false);
        joinSession(sessionId, user.email, user.display_name || "")
            .then(({ jitsi_room, jitsi_jwt }) =>
                setJitsiInfo({ jitsi_room, jitsi_jwt }),
            )
            .catch((err) => {
                setFailed(true);
                toastError(err, "Unable to join session");
            })
            .finally(() => setLoading(false));
    }, [authLoading, user, sessionId]);

    if (authLoading || !sessionId) {
        return (
            <div className="session-room">
                <p className="muted session-room-status">Loading session…</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="session-room">
                <p>
                    Please <Link href="/login">login</Link> to join this session.
                </p>
            </div>
        );
    }

    return (
        <div className="session-room">
            <header className="session-room-bar">
                <button
                    type="button"
                    className="btn secondary"
                    onClick={() => router.back()}
                >
                    ← Leave session
                </button>
                <span className="muted session-room-user">
                    {user.display_name || user.email}
                </span>
            </header>

            {loading && (
                <p className="muted session-room-status">Connecting to meeting room…</p>
            )}
            {failed && !loading && (
                <div className="session-room-error card">
                    <Link href="/dashboard/student" className="btn btn-error-outline">
                        Back to dashboard
                    </Link>
                </div>
            )}
            {jitsi_info && !loading && (
                <JitsiEmbed
                    display_name={user.display_name!}
                    email={user.email}
                    fullscreen
                    jitsi_jwt={jitsi_info.jitsi_jwt}
                    jitsi_room={jitsi_info.jitsi_room}
                />
            )}
        </div>
    );
}

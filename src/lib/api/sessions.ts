import { api } from "./client";

export interface Session {
    id: string;
    listing_id: string;
    scheduled_at: string;
    jitsi_url: string;
    status: string;
    is_active: boolean;
}

export async function fetchListingSessions(
    listingId: string,
): Promise<Session[]> {
    return api<Session[]>(`/sessions/listings/${listingId}`);
}

export async function joinSession(
    sessionId: string,
    email: string,
    user_name: string,
): Promise<{ jitsi_jwt: string; jitsi_room: string }> {
    return api<{ jitsi_jwt: string; jitsi_room: string }>(
        `/sessions/${sessionId}/join`,
        { method: "POST", body: JSON.stringify({ user_name, email }) },
    );
}

export async function createSession(payload: {
    listing_id: string;
    scheduled_at: string;
}) {
    return api("/sessions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateSession(
    sessionId: string,
    payload: { status?: string; scheduled_at?: string; is_active?: boolean },
) {
    return api(`/sessions/${sessionId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

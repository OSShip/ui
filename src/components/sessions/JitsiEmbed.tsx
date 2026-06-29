import { JaaSMeeting } from "@jitsi/react-sdk";

export function JitsiEmbed({
    jitsi_jwt,
    jitsi_room,
    display_name,
    email,
    fullscreen = false,
}: {
    jitsi_jwt: string;
    jitsi_room: string;
    display_name: string;
    email: string;
    fullscreen?: boolean;
}) {

    return (
        <div className={fullscreen ? "jitsi jitsi-fullscreen" : "jitsi"}>
            <JaaSMeeting
                roomName={jitsi_room || ""}
                jwt={jitsi_jwt || ""}
                userInfo={{ displayName: display_name, email }}
                interfaceConfigOverwrite={{ fullscreen }}
                appId={process.env.NEXT_PUBLIC_JITSI_APP_ID || ""}
            />
            {!fullscreen && (
                <a
                    href={""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn secondary"
                >
                    Open in new tab
                </a>
            )}
        </div>
    );
}

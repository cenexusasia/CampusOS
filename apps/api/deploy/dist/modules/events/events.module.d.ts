export declare const EVENTS: {
    readonly COURSE_CREATED: "course.created";
    readonly STUDENT_ENROLLED: "student.enrolled";
    readonly KNOWLEDGE_UPLOADED: "knowledge.uploaded";
    readonly CONNECTOR_SYNCED: "connector.synced";
    readonly AGENT_EXECUTED: "agent.executed";
};
export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
export declare class EventsModule {
}

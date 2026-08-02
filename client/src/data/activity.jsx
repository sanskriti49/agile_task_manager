import { TicketTag } from "../components/TicketTag";
export function activityText(item) {
	switch (item.type) {
		case "moved":
			return (
				<>
					moved <TicketTag>{item.ticketId}</TicketTag> · {item.detail}
				</>
			);
		case "commented":
			return (
				<>
					commented on <TicketTag>{item.ticketId}</TicketTag>
				</>
			);
		case "created":
			return (
				<>
					opened <TicketTag>{item.ticketId}</TicketTag>
				</>
			);
		default:
			return (
				<>
					updated <TicketTag>{item.ticketId}</TicketTag>
				</>
			);
	}
}

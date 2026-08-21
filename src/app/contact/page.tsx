import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Shaare Tzadaka.",
};

export default function ContactPage() {
  return (
    <Prose title="Contact" lead="Pick the path that matches what you need — it gets there faster.">
      <ul>
        <li>
          <strong>You run an organization and want to take over its listing:</strong>{" "}
          <Link href="/claim">claim it</Link>.
        </li>
        <li>
          <strong>You want a listing taken down:</strong>{" "}
          <Link href="/request-removal">request removal</Link>. No justification needed.
        </li>
        <li>
          <strong>Something on a listing is wrong or looks fraudulent:</strong>{" "}
          <Link href="/report">report it</Link>. Payment-detail reports are handled first.
        </li>
      </ul>

      <h2>Anything else</h2>
      <p>
        Press, copyright complaints, a rav with a question about how we handle something, or an
        organization that wants to be listed and cannot find itself — use the{" "}
        <Link href="/report">report form</Link> for now and say what it is about. A dedicated
        mailbox goes here before launch.
      </p>
    </Prose>
  );
}

import type { Metadata } from "next";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Shaare Tzadaka stores, what it does not, and where your giving data lives.",
};

export default function PrivacyPage() {
  return (
    <Prose title="Privacy" lead="The short version: your giving data is on your device, not ours.">
      <p className="rounded-[8px] bg-bronze-100 p-4 text-sm text-bronze-600">
        <strong>Draft.</strong> This describes current behavior. Review it whenever the data model
        changes — in particular when accounts are added.
      </p>

      <h2>Your maaser data</h2>
      <p>
        Your income, your chosen percentage, your logged gifts, your giving list and your favorites
        are stored in your browser&rsquo;s local storage on this device. They are not sent to us.
        Clearing your browser data deletes them, and they do not follow you to another device.
        Export a CSV if you want a copy that survives.
      </p>
      <p>
        When accounts arrive, income will be encrypted at rest and will remain the single field we
        treat most carefully. It exists only so we can subtract from it.
      </p>

      <h2>Location</h2>
      <p>
        &ldquo;Near me&rdquo; asks your browser for a coordinate, sends it to our server to sort
        listings by distance, and gets listings back. We do not store the coordinate and do not
        keep a history of where you have been. Declining the prompt costs you nothing — pick a city
        instead.
      </p>

      <h2>What we do collect</h2>
      <ul>
        <li>
          Ordinary server logs for the requests you make, including IP address, kept only as long
          as needed to keep the site running and to deal with abuse.
        </li>
        <li>
          Aggregate product analytics — which categories are opened, whether a payment handle got
          copied. We use this to tell whether the handoff works, not to build a profile of you.
        </li>
        <li>
          What you type into a claim, removal or report form, so that a person can act on it.
        </li>
      </ul>

      <h2>What we never do</h2>
      <ul>
        <li>Sell or rent anything about you.</li>
        <li>Tell an organization that you looked at it, saved it, or intended to give to it.</li>
        <li>Take payment details. There is no card form on this site.</li>
      </ul>

      <h2>Organizations</h2>
      <p>
        Information about organizations is public record or supplied by the organization for
        publication. An organization can ask us to remove its listing and we will.
      </p>
    </Prose>
  );
}

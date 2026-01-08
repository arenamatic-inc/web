import PageLayout from "../PageLayout";

export default function APrivacy() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Arenamatic Privacy Policy</h1>
      <p className="mb-6"><strong>Effective February 1, 2024</strong></p>

      <h2 className="mt-6 text-xl font-semibold">INFORMATION WE COLLECT</h2>
      <p className="mt-2">
        The Arenamatic platform maintains the following personal information for all app users whether they are Members or not:
      </p>
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        <li>First and Last names as indicated in their profile</li>
        <li>An abbreviation that the user selects to indicate their place on a waiting list</li>
        <li>Email address used to create their account</li>
        <li>Handicaps</li>
        <li>Results of games and matches that they have played and the dates and times of those matches</li>
        <li>Payment information</li>
      </ul>
      <p className="mt-4">
        In the course of regular business, video is recorded (a) at each table and (b) in the room in general.
        These video recordings that are always on are captured by devices with no microphones.
        Generally there is no audio recording.
      </p>

      <h2 className="mt-6 text-xl font-semibold">HOW YOUR INFORMATION IS USED</h2>

      <h3 className="mt-4 font-semibold">First and Last Name</h3>
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        <li>In the room, First and Last name may be displayed on overlaid scoring information on live feeds at the table</li>
        <li>Table video including the scoring overlay with players’ names may be posted by the club for promotional purposes without notice</li>
        <li>
          Results for matches played in the Club may be posted as a general matter of course and be searchable on the public website.
          The intent is to provide transparency to all especially around handicapping.
          Tournament and League results may be posted immediately or even while in-progress.
        </li>
      </ul>

      <h3 className="mt-4 font-semibold">Abbreviation</h3>
      <p className="mt-2">
        The abbreviation selected by the user will be displayed to anybody who is looking at the waiting list for a table.
        This waiting list is viewable in the app by any user and may be available on the website to help people determine
        whether it’s a good time for them to visit the club.
      </p>

      <h3 className="mt-4 font-semibold">Email Address</h3>
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        <li>Your email address will never be shared publicly</li>
        <li>Your email address will be used to notify members of policy changes. These emails will be infrequent and may not be unsubscribed</li>
        <li>
          Your email address will be used to contact you for other reasons that may be unsubscribed,
          including events and promotions and any other notifications as may be required from time to time
        </li>
      </ul>

      <h3 className="mt-4 font-semibold">Handicaps</h3>
      <p className="mt-2">
        Players handicaps, past and present are considered public information and may be shared via any channel by the club.
      </p>

      <h3 className="mt-4 font-semibold">Game and Match Results</h3>
      <p className="mt-2">
        The club implements a handicap system and transparency is a key goal. The results for every match played in the club
        will be publicly available, including players’ names.
      </p>

      <h3 className="mt-4 font-semibold">Video</h3>
      <p className="mt-2">
        Video taken, including the players names and overlaid scores may be posted and used in any manner the club sees fit including, but not limited to:
      </p>
      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
        <li>Live Feeds of matches</li>
        <li>Posting of events of note, e.g. high break of the week, best shot of the day</li>
        <li>Various security concerns</li>
      </ul>

      <h3 className="mt-4 font-semibold">Audio</h3>
      <p className="mt-2">
        While the fixed cameras in the club do not record audio, it is foreseeable that there may be events where audio is broadcast and recorded for live streams.
        There is some interest in remote coaching opportunities which may require audio from the club to be transmitted.
      </p>

      <h3 className="mt-4 font-semibold">Payment Information</h3>
      <p className="mt-2">
        The club will maintain a record of payments made, but does not have access to credit card details.
        These are sent directly from the app to the payment provider and never sent to the Club’s servers.
      </p>

      <h2 className="mt-6 text-xl font-semibold">CORRECTING YOUR INFORMATION</h2>
      <p className="mt-2">
        If there is an error that requires correction, contact{" "}
        <a href="mailto:info@arenamatic.ca" className="text-blue-600 underline">
          info@arenamatic.ca
        </a>{" "}
        to resolve.
      </p>
    </div>
  );
}

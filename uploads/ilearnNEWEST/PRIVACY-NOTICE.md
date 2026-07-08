# iLearn Privacy Notice - Controlled Pilot

Status: draft pilot notice. This is not legal advice and should be reviewed by
the operator/client before live use.

## Operator

- Organisation: `[Operator organisation name]`
- Contact email: `[privacy/contact email]`
- Data protection contact: `[DPO or responsible person]`
- Client/service: `[Client or council/service name]`

## What data is collected

iLearn may store:

- learner name
- lesson progress and completion dates
- support/prompt level recorded by staff
- certificate reference
- staff account name and email
- consent/capacity notes entered by staff
- audit log entries for meaningful actions

## Why data is collected

Data is used to deliver the digital-skills course, continue learner progress,
support staff reporting, evidence learning outcomes and manage safeguarding or
consent records during the pilot.

## Lawful basis

The operator/client must confirm the lawful basis before live use. Possible
bases may include consent, legitimate interests or public task depending on the
service context.

## Who can access data

Learners can access their own learning journey by entering their name. Staff
admins can view learner progress, support notes, consent/capacity records and
reports for the service.

## Hosting and storage

Hosting provider: `[Hosting provider, e.g. Render]`

Database: persistent PostgreSQL database required for real learner data.

## Retention

Pilot retention period: `[set period, e.g. 6 months after pilot end]`

The operator should delete or export learner data when the pilot ends unless a
continued service agreement is in place.

## Learner rights

Learners or representatives can ask the operator/client about access, correction
or deletion of personal data. Requests should be handled under the operator's
data protection process.

## Known pilot limitation

The learner start screen uses name-based continuation for accessibility. This is
simple for supported learners but not a strong identity check. For broader
production rollout, add staff-issued learner codes or another accessible
identity control.

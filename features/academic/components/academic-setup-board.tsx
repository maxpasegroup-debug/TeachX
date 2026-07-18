"use client";

import { useActionState } from "react";
import type { AcademicYear, Branch, Department, PlannerEvent, Room, TimeSlot } from "@prisma/client";

import { createAcademicYearAction, createBranchAction, createDepartmentAction, createPlannerEventAction, createRoomAction, createTimeSlotAction } from "@/features/academic/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, sentenceCase } from "@/lib/format";

type AcademicSetupBoardProps = {
  branches: Branch[];
  academicYears: AcademicYear[];
  departments: Department[];
  timeSlots: TimeSlot[];
  rooms: Room[];
  events: PlannerEvent[];
};

export function AcademicSetupBoard({ branches, academicYears, departments, timeSlots, rooms, events }: AcademicSetupBoardProps) {
  const [branchMessage, branchAction, branchPending] = useActionState(createBranchAction, undefined);
  const [yearMessage, yearAction, yearPending] = useActionState(createAcademicYearAction, undefined);
  const [departmentMessage, departmentAction, departmentPending] = useActionState(createDepartmentAction, undefined);
  const [slotMessage, slotAction, slotPending] = useActionState(createTimeSlotAction, undefined);
  const [roomMessage, roomAction, roomPending] = useActionState(createRoomAction, undefined);
  const [eventMessage, eventAction, eventPending] = useActionState(createPlannerEventAction, undefined);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Branches</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create physical or operating branches under the institution.</p>
          <form action={branchAction} className="mt-6 grid gap-4">
            <Field label="Branch name" name="name" placeholder="Main Campus" />
            <Field label="Code" name="code" placeholder="MAIN" />
            <Field label="Contact" name="contact" placeholder="+91 90000 00000" />
            <Textarea name="address" placeholder="Address" />
            <FormFooter message={branchMessage} pending={branchPending} submit="Add branch" />
          </form>
          <List items={branches.map((branch) => `${branch.name} · ${branch.code}`)} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Academic years</h2>
          <p className="mt-1 text-sm text-muted-foreground">Define years that courses, batches, and planners will use.</p>
          <form action={yearAction} className="mt-6 grid gap-4">
            <Field label="Year name" name="name" placeholder="2026-2027" />
            <Field label="Start date" name="startDate" type="date" />
            <Field label="End date" name="endDate" type="date" />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input className="h-4 w-4" name="isCurrent" type="checkbox" />
              Current year
            </label>
            <FormFooter message={yearMessage} pending={yearPending} submit="Add year" />
          </form>
          <List items={academicYears.map((year) => `${year.name} · ${year.isCurrent ? "Current" : sentenceCase(year.status)}`)} />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Departments</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep academic ownership simple and flexible.</p>
          <form action={departmentAction} className="mt-6 grid gap-4">
            <Field label="Department name" name="name" placeholder="Science" />
            <Field label="Code" name="code" placeholder="SCI" />
            <FormFooter message={departmentMessage} pending={departmentPending} submit="Add department" />
          </form>
          <List items={departments.map((department) => department.name)} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Rooms</h2>
          <p className="mt-1 text-sm text-muted-foreground">Rooms are reusable in the planner and daily overrides.</p>
          <form action={roomAction} className="mt-6 grid gap-4">
            <Field label="Room name" name="name" placeholder="Room 101" />
            <Field label="Code" name="code" placeholder="R101" />
            <Field label="Capacity" name="capacity" type="number" />
            <Select name="branchId">
              <option value="">No branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            <FormFooter message={roomMessage} pending={roomPending} submit="Add room" />
          </form>
          <List items={rooms.map((room) => `${room.name}${room.capacity ? ` · ${room.capacity}` : ""}`)} />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Time slots</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create periods, breaks, lunch, and custom shifts. Nothing is hardcoded.</p>
          <form action={slotAction} className="mt-6 grid gap-4">
            <Field label="Slot name" name="name" placeholder="Period 1" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Starts" name="startsAt" type="time" />
              <Field label="Ends" name="endsAt" type="time" />
            </div>
            <Select name="type">
              <option value="CLASS">Class</option>
              <option value="BREAK">Tea Break</option>
              <option value="LUNCH">Lunch Break</option>
              <option value="CUSTOM">Custom</option>
            </Select>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Shift" name="shift" placeholder="Morning" />
              <Field label="Order" name="order" type="number" />
            </div>
            <FormFooter message={slotMessage} pending={slotPending} submit="Add slot" />
          </form>
          <List items={timeSlots.map((slot) => `${slot.name} · ${slot.startsAt}-${slot.endsAt}`)} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add holidays, special holidays, and academic events.</p>
          <form action={eventAction} className="mt-6 grid gap-4">
            <Field label="Title" name="title" placeholder="Founder's Day" />
            <Select name="type">
              <option value="EVENT">Event</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="SPECIAL_HOLIDAY">Special Holiday</option>
            </Select>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Starts" name="startsAt" type="date" />
              <Field label="Ends" name="endsAt" type="date" />
            </div>
            <Select name="academicYearId">
              <option value="">No year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </Select>
            <Textarea name="description" placeholder="Notes" />
            <FormFooter message={eventMessage} pending={eventPending} submit="Add item" />
          </form>
          <List items={events.map((event) => `${event.title} · ${formatDate(event.startsAt)}`)} />
        </Card>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} placeholder={placeholder} type={type} />
    </div>
  );
}

function FormFooter({ message, pending, submit }: { message?: string; pending: boolean; submit: string }) {
  return (
    <div className="flex items-center gap-4">
      <Button disabled={pending} type="submit">
        {pending ? "Saving" : submit}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (!items.length) return <p className="mt-6 rounded-lg bg-muted px-4 py-5 text-sm text-muted-foreground">Nothing added yet.</p>;

  return (
    <div className="mt-6 space-y-2">
      {items.slice(0, 5).map((item) => (
        <p className="rounded-lg bg-muted px-4 py-3 text-sm font-medium" key={item}>
          {item}
        </p>
      ))}
    </div>
  );
}

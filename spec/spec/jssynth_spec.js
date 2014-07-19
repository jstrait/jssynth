describe("JSSynth.Note", function() {
  it("should construct a Note properly", function() {
    var note = new JSSynth.Note("A", 3, 1);

    expect(note.noteName).toEqual("A");
    expect(note.octave).toEqual(3);
    expect(note.duration).toEqual(1);
    expect(note.frequency()).toEqual(220.0);
  });
});

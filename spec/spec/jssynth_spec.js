describe("JSSynth.Note", function() {
  it("should construct a Note properly", function() {
    var note = new JSSynth.Note('A', 3, 1);

    expect(note.noteName).toEqual('A');
    expect(note.octave).toEqual(3);
    expect(note.duration).toEqual(1);
    expect(note.frequency).toEqual(220.0);
  });

  it("should convert string values to numbers where appropriate", function() {
    var note = new JSSynth.Note('A', '3', '2');

    expect(note.noteName).toEqual('A');
    expect(note.octave).toEqual(3);
    expect(note.duration).toEqual(2);
    expect(note.frequency).toEqual(220.0);
  });
});

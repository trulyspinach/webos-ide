import spinach_rope as r

class Rope:
    def __init__(self, str):
        self.rope = r.rope(str)

    def replace(self, startIndex, length, text):
        self.rope.delete(startIndex, startIndex + length)
        print("insert")
        self.rope.insert(startIndex, text)

    def __repr__(self):
        return self.rope.get_str()


tmp = Rope("")
print("first")
tmp.replace(0, 0, "a")
print("second")
tmp.replace(1, 0, "b")
print("thrid")
tmp.replace(2, 0, "c")
print(tmp)

tmp.replace(0, 1, "")
print(tmp)
